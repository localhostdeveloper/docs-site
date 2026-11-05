// Writes llms.txt (a short index of the site) and llms-full.txt (every page
// as plain text, in reading order) into the built site, for AI assistants and
// other programs that would otherwise crawl every page. They are made from the
// same sources as the pages at every build, so they can't fall behind them.
// See https://llmstxt.org for the convention.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve, posix, extname } from "node:path";

type SidebarGroup = { text: string; items: { text: string; link: string }[] };
type Options = { site: string; title: string; description: string; sidebar: SidebarGroup[]; repoLinks: Record<string, string> };
type Page = { path: string; file: string; title: string; description: string; html: boolean };

// The site's own pages, in the order a reader meets them.
const PRODUCT = ["index", "media-server", "packages", "about", "contact"];
// Pages listed in llms.txt but left out of llms-full.txt: forms and lists of other pages.
const INDEX_ONLY = new Set(["order", "blog/index"]);
const LEGAL = ["privacy", "disclaimer"];

export function writeLLMFiles(srcDir: string, outDir: string, sources: string[], opt: Options) {
  const pages = new Map<string, Page>();
  for (const rel of sources) {
    const path = rel.replace(/\.md$/, "");
    const file = join(srcDir, rel);
    const { fm } = frontmatter(readFileSync(file, "utf8"));
    pages.set(path, { path, file, title: fm.title || path, description: fm.description || "", html: fm.layout === "page" });
  }
  const docs = opt.sidebar.flatMap((g) => g.items.map((i) => i.link.replace(/^\//, "")));
  const under = (dir: string) => [...pages.keys()].filter((p) => p.startsWith(dir + "/")).sort((a, b) => (a.endsWith("/index") ? -1 : b.endsWith("/index") ? 1 : a.localeCompare(b)));
  const blog = under("blog").filter((p) => p !== "blog/index").sort().reverse();
  const order = [...PRODUCT, ...docs, ...under("features"), ...under("solutions"), "glossary", ...blog];
  const rest = [...pages.keys()].filter((p) => !order.includes(p) && !LEGAL.includes(p) && p !== "release-notes" && !INDEX_ONLY.has(p)).sort();
  const full = [...order, ...rest, "release-notes", ...LEGAL].filter((p) => pages.has(p) && !INDEX_ONLY.has(p));

  const notes = pages.get("release-notes");
  const latest = notes ? latestRelease(readFileSync(notes.file, "utf8")) : null;
  const versionLine = latest ? `Current version: ${latest.version}${latest.date ? `, released ${latest.date}` : ""}.` : "";
  const built = new Date().toISOString().slice(0, 10);
  const url = (p: string) => pageURL(opt.site, p);

  // llms.txt
  const item = (p: string, text?: string) => {
    const pg = pages.get(p);
    if (!pg) return null;
    return `- [${text || pg.title}](${url(p)})${pg.description ? `: ${pg.description}` : ""}`;
  };
  const section = (name: string, list: (string | null)[]) => {
    const rows = list.filter(Boolean);
    return rows.length ? `## ${name}\n\n${rows.join("\n")}\n` : "";
  };
  const index = [
    `# ${opt.title}`,
    "",
    `> ${opt.description}`,
    "",
    [versionLine, `Every page of this site as one plain-text file, made with the site at every build: ${opt.site}/llms-full.txt`].filter(Boolean).join(" "),
    "",
    section("The product", [...PRODUCT.filter((p) => p !== "index"), "order", ...under("features"), ...under("solutions")].map((p) => item(p))),
    ...opt.sidebar.map((g) => section(`Docs: ${g.text}`, g.items.map((i) => item(i.link.replace(/^\//, ""), i.text)))),
    section("Releases", [item("release-notes")]),
    section("Optional", [item("glossary"), ...blog.map((p) => item(p)), ...rest.map((p) => item(p)), ...LEGAL.map((p) => item(p))]),
  ].join("\n");
  writeFileSync(join(outDir, "llms.txt"), tidy(index) + "\n");

  // llms-full.txt
  const head = [
    `# ${opt.title}: the whole website in one file`,
    "",
    `Every page of ${opt.site} as plain text, in reading order. It is made from the same sources as the pages each time the site is built, so it is never older than they are.`,
    "",
    ...(versionLine ? [`- ${versionLine} The release notes are near the end of this file.`] : []),
    `- Built on ${built}.`,
    `- Each page starts with a "Page:" line giving its address; links point at the website.`,
    `- In the package lists, a line starting "Not included:" is a tool that package does not have.`,
  ].join("\n");
  const parts = [head];
  for (const p of full) {
    const pg = pages.get(p)!;
    const body = readPage(pg, opt);
    parts.push(
      [
        "\n\n================================================================",
        `Page: ${url(p)}`,
        `Title: ${pg.title}`,
        ...(pg.description ? [`Summary: ${pg.description}`] : []),
        "================================================================\n",
        body,
      ].join("\n"),
    );
  }
  writeFileSync(join(outDir, "llms-full.txt"), tidy(parts.join("\n")) + "\n");
}

function pageURL(site: string, path: string): string {
  if (path === "index") return `${site}/`;
  if (path.endsWith("/index")) return `${site}/${path.slice(0, -"index".length)}`;
  return `${site}/${path}`;
}

function frontmatter(src: string): { fm: Record<string, string>; body: string } {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { fm: {}, body: src };
  const fm: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const k = line.match(/^([\w-]+):\s*(.*)$/);
    if (!k) continue;
    let v = k[2].trim();
    if (/^".*"$/.test(v)) v = v.slice(1, -1).replace(/\\"/g, '"');
    else if (/^'.*'$/.test(v)) v = v.slice(1, -1).replace(/''/g, "'");
    fm[k[1]] = v;
  }
  return { fm, body: src.slice(m[0].length) };
}

// The newest "## vX.Y.Z" section outside HTML comments, and the date under it.
function latestRelease(src: string): { version: string; date: string } | null {
  const text = src.replace(/<!--[\s\S]*?-->/g, "");
  const m = text.match(/^## (v\d+\.\d+\.\d+)[^\n]*\n+\*([^*\n]+)\*/m) || text.match(/^## (v\d+\.\d+\.\d+)/m);
  return m ? { version: m[1], date: (m[2] || "").trim() } : null;
}

function readPage(pg: Page, opt: Options): string {
  const { body } = frontmatter(readFileSync(pg.file, "utf8"));
  return pg.html ? htmlToText(body, pg.path, opt) : cleanMarkdown(includes(body, dirname(pg.file)), pg.file, pg.path, opt);
}

// VitePress's <!--@include: file--> lines, as the page shows them.
function includes(src: string, dir: string, depth = 0): string {
  if (depth > 3) return src;
  return src.replace(/<!--@include:\s*(.+?)\s*-->/g, (m, p) => {
    const file = resolve(dir, p.trim());
    if (!existsSync(file)) return m;
    return includes(frontmatter(readFileSync(file, "utf8")).body, dirname(file), depth + 1);
  });
}

function absolute(href: string, path: string, opt: Options): string {
  if (opt.repoLinks[href]) href = opt.repoLinks[href];
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return href; // https:, mailto:
  const page = pageURL(opt.site, path);
  if (href.startsWith("#")) return page + href;
  const [p, hash = ""] = href.split("#");
  let target = p.startsWith("/") ? p : posix.join("/", posix.dirname(path), p);
  target = target.replace(/\.md$/, "").replace(/\.html$/, "").replace(/(^|\/)index$/, "$1");
  return opt.site + target + (hash ? "#" + hash : "");
}

function cleanMarkdown(src: string, file: string, path: string, opt: Options): string {
  const out: string[] = [];
  let fence = "";
  let comment = false;
  let script = false;
  for (const raw of src.split(/\r?\n/)) {
    if (fence) {
      out.push(raw);
      if (raw.trim().startsWith(fence)) fence = "";
      continue;
    }
    if (script) {
      if (/<\/script>/i.test(raw)) script = false;
      continue;
    }
    // HTML comments, which may span lines (the release notes keep a draft in one).
    let line = "";
    let rest = raw;
    while (rest) {
      if (comment) {
        const end = rest.indexOf("-->");
        if (end < 0) rest = "";
        else {
          rest = rest.slice(end + 3);
          comment = false;
        }
      } else {
        const start = rest.indexOf("<!--");
        if (start < 0) {
          line += rest;
          rest = "";
        } else {
          line += rest.slice(0, start);
          rest = rest.slice(start + 4);
          comment = true;
        }
      }
    }
    if (line.trim() === "" && raw.trim() !== "") continue; // the line was all comment
    const f = line.match(/^\s*(`{3,}|~{3,})/);
    if (f) {
      fence = f[1];
      out.push(line.replace(/\s*\[[^\]]*\]\s*$/, "")); // ```js [Node] -> ```js
      continue;
    }
    if (/^\s*<(script|style)\b/i.test(line)) {
      script = !/<\/(script|style)>/i.test(line);
      continue;
    }
    const snip = line.match(/^<<<\s+(\S+?)(?:\{(\w+)\})?\s*$/);
    if (snip) {
      const target = resolve(dirname(file), snip[1]);
      const lang = snip[2] || extname(target).slice(1);
      if (existsSync(target)) out.push("```" + lang, readFileSync(target, "utf8").replace(/\n+$/, ""), "```");
      continue;
    }
    const box = line.match(/^:::\s*(\S*)\s*(.*)$/);
    if (box) {
      if (box[1] && box[1] !== "code-group" && box[1] !== "details") {
        const kind = box[1][0].toUpperCase() + box[1].slice(1);
        out.push(`**${kind}${box[2] ? ": " + box[2] : ""}**`);
      } else if (box[1] === "details" && box[2]) out.push(`**${box[2]}**`);
      continue;
    }
    line = line.replace(/\s*\{#[\w-]+\}\s*$/, "");
    // Pictures written as HTML in a markdown page: their description.
    line = line.replace(/<a\b[^>]*>\s*(<img\b[^>]*>)\s*<\/a>/gi, "$1").replace(/<img\b([^>]*)>/gi, (_m, at) => (attr(at, "alt") ? `(Picture: ${attr(at, "alt")})` : ""));
    line = line.replace(/(!?)\[([^\]]*)\]\(([^)\s]+)((?:\s+"[^"]*")?)\)/g, (_m, bang, text, href, title) => `${bang}[${text}](${absolute(href, path, opt)}${title})`);
    out.push(line);
  }
  return out.join("\n");
}

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rarr: "→", larr: "←",
  mdash: "—", ndash: "–", hellip: "…", copy: "©", times: "×", middot: "·", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“",
};
function decode(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const n = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

function attr(attrs: string, name: string): string {
  const m = attrs.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));
  return m ? decode(m[2] ?? m[3] ?? "") : "";
}

// The site's own pages are HTML inside markdown: headings, lists, tables,
// questions and cards become plain text and markdown.
function htmlToText(src: string, path: string, opt: Options): string {
  let s = src
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, "");
  s = s.replace(/<VideoTour\b([^>]*?)\/?>/g, (_m, a) => `\n\nVideo: ${attr(a, "title")}${attr(a, "length") ? ` (${attr(a, "length")})` : ""}, https://www.youtube.com/watch?v=${attr(a, "id")}\n\n`);
  s = s.replace(/<ClientOnly>[\s\S]*?<\/ClientOnly>/g, "\n\n(A form: open the page in a browser to use it.)\n\n");
  s = s.replace(/<[A-Z][A-Za-z]*\b[^>]*\/>/g, ""); // other components
  s = s.replace(/<table\b[\s\S]*?<\/table>/gi, (t) => table(t, path, opt));
  s = s.replace(/<details\b[^>]*>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>/gi, (_m, q) => `\n\n**${inline(q, path, opt).trim()}**\n\n`).replace(/<\/details>/gi, "\n\n");
  s = s.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_m, n, t) => `\n\n${"#".repeat(Number(n))} ${inline(t, path, opt).replace(/\s+/g, " ").trim()}\n\n`);
  s = s.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_m, t) => `\n- ${inline(t, path, opt).replace(/\s+/g, " ").trim()}`);
  s = s.replace(/<\/?(p|div|section|ul|ol|header|footer|main|article|figure|figcaption|blockquote|nav|aside|form|dl|dt|dd|br|hr)\b[^>]*>/gi, "\n\n");
  // One item a line: the source's line breaks between <li>s left blank lines.
  return tidy(inline(s, path, opt)).replace(/^(- .*)\n\n(?=- )/gm, "$1\n").replace(/^(- .*)\n\n(?=- )/gm, "$1\n");
}

function inline(s: string, path: string, opt: Options): string {
  s = s.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_m, a, t) => {
    const href = attr(a, "href");
    const text = inline(t, path, opt).trim();
    if (!href) return text;
    const to = absolute(href, path, opt);
    if (/\n/.test(text)) return `${text}\n(${to})\n`;
    return text ? `[${text.replace(/\s+/g, " ")}](${to})` : "";
  });
  s = s.replace(/<img\b([^>]*)>/gi, (_m, a) => (attr(a, "alt") ? `(Picture: ${attr(a, "alt")})` : ""));
  s = s.replace(/<(b|strong)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _t, x) => `**${x.trim()}**`);
  s = s.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _t, x) => `*${x.trim()}*`);
  s = s.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_m, x) => "`" + x + "`");
  s = s.replace(/<\/?span\b[^>]*>/gi, " ");
  s = s.replace(/<\/?[a-z][^>]*>/gi, "");
  return decode(s);
}

function table(t: string, path: string, opt: Options): string {
  const rows = [...t.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((r) =>
    [...r[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((c) => {
      let v = inline(c[1], path, opt).replace(/\s+/g, " ").trim();
      if (v === "✓") v = "Yes";
      else if (v === "—" || v === "–") v = "No";
      return v.replace(/\|/g, "\\|");
    }),
  );
  if (!rows.length) return "";
  const width = Math.max(...rows.map((r) => r.length));
  const line = (r: string[]) => "| " + Array.from({ length: width }, (_v, i) => r[i] ?? "").join(" | ") + " |";
  return "\n\n" + [line(rows[0]), line(Array(width).fill("---")), ...rows.slice(1).map(line)].join("\n") + "\n\n";
}

// Trailing spaces and HTML indentation off, runs of blank lines to one;
// code blocks left as they are.
function tidy(s: string): string {
  const out: string[] = [];
  let fence = "";
  for (const raw of s.split("\n")) {
    if (fence) {
      out.push(raw.replace(/\s+$/, ""));
      if (raw.trim().startsWith(fence)) fence = "";
      continue;
    }
    const f = raw.match(/^\s*(`{3,}|~{3,})/);
    if (f) fence = f[1];
    let line = raw.replace(/\s+$/, "");
    // Markdown keeps its indentation (nested lists); HTML leftovers don't need theirs.
    if (/^\s+(\S)/.test(line) && !/^\s+([-*+]|\d+\.)\s/.test(line) && !/^ {4}/.test(line)) line = line.trimStart();
    line = line.replace(/(\S) {2,}/g, "$1 ");
    if (line === "" && out[out.length - 1] === "") continue;
    out.push(line);
  }
  while (out.length && out[0] === "") out.shift();
  while (out.length && out[out.length - 1] === "") out.pop();
  return out.join("\n");
}
