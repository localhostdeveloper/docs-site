// Builds the licence agreement PDF from contract-text.js: blank (the file
// buyers download) or filled in from the online order form, with the buyer's
// side locked and ours left to fill in. Uses only the standard PDF fonts, so
// nothing is embedded and every reader shows the same thing.
import pdfLib from "pdf-lib";
import {
  VERSION, DATE, EMAIL, VENDOR, VENDOR_ADDRESS, VENDOR_REG_NO,
  INTRO, STEPS, PAPER, PACKAGES, HOSTING, FIELDS, TERMS, SIGN_INTRO, md,
} from "./contract-text.js";

const { PDFDocument, StandardFonts, rgb, PDFName, PDFString } = pdfLib;

const A4 = [595.28, 841.89];
const M = 54;                    // side margins
const CW = A4[0] - 2 * M;        // content width
const TOP = 58;
const BOTTOM = 62;               // the footer sits below this

const hex = (h) => rgb(parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255);
const C = {
  ink: hex("0f172a"), body: hex("334155"), muted: hex("64748b"),
  brand: hex("2563eb"), brandDark: hex("1d4ed8"), soft: hex("eff6ff"),
  line: hex("e2e8f0"), fieldBg: hex("f8fafc"), fieldBorder: hex("94a3b8"), white: rgb(1, 1, 1),
};

const runs = (text) => md(text).map((p) => ({ t: p.t, f: p.bold ? "bold" : "reg" }));

// textWidth measures text the way drawText draws it. pdf-lib's own
// widthOfTextAtSize adds kerning that drawText never applies, which squeezed
// the space after words such as "You".
function textWidth(font, s, size) {
  let w = 0;
  for (const ch of s) w += font.widthOfTextAtSize(ch, size);
  return w;
}

function roundRect(w, h, r) {
  return `M ${r} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} V ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} ` +
    `H ${r} A ${r} ${r} 0 0 1 0 ${h - r} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
}

// Letters the standard fonts lack, spelled the nearest way they have.
const SPELL = { "ɛ": "e", "Ɛ": "E", "ɔ": "o", "Ɔ": "O", "ŋ": "ng", "Ŋ": "Ng", "ƒ": "f" };

// safeText rewrites text so a standard font can show it: accents the font
// lacks are dropped, letters it lacks spelled nearby, anything else "?".
function safeText(charset, s) {
  let out = "";
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (ch === "\n" || charset.has(cp)) { out += ch; continue; }
    if (SPELL[ch]) { out += SPELL[ch]; continue; }
    const plain = ch.normalize("NFKD").replace(/[̀-ͯ]/g, "");
    out += plain && [...plain].every((c) => charset.has(c.codePointAt(0))) ? plain : "?";
  }
  return out;
}

// formFont names the font the boxes' text is drawn in as the form's default
// (AcroForm DR and DA). Each box asks for "Helvetica"; a PDF app that redraws
// a box after typing looks the name up there, and without it some apps could
// not fill the boxes at all (found on a buyer's signed agreement, 2026-10-20).
function formFont(pdf, font) {
  const acro = pdf.getForm().acroForm.dict;
  acro.set(PDFName.of("DR"), pdf.context.obj({ Font: { Helvetica: font.ref } }));
  acro.set(PDFName.of("DA"), PDFString.of("/Helvetica 10 Tf 0 g"));
}

// fitFontSize is the largest font size (start down to 6) at which a
// one-line value fits a box w wide.
function fitFontSize(font, value, w, start = 10) {
  let size = start;
  while (size > 6 && textWidth(font, value, size) > w - 4) size -= 0.5;
  return size;
}

class Layout {
  constructor(pdf, fonts, fill) {
    this.pdf = pdf;
    this.form = pdf.getForm();
    this.F = fonts;
    this.fill = fill;
    this.charset = new Set(fonts.reg.getCharacterSet());
    this.pages = [];
    this.names = new Set();
    this.newPage();
  }

  safe(s) {
    return safeText(this.charset, s);
  }

  newPage() {
    this.page = this.pdf.addPage(A4);
    this.pages.push(this.page);
    this.y = A4[1] - TOP;
    if (this.pages.length > 1) {
      const top = A4[1] - 34;
      this.logo(M, top + 1, 11);
      this.text("Unda Media Server Licence Agreement", M + 17, top - 8, 8, "bold", C.muted);
      this.text(VENDOR, A4[0] - M - textWidth(this.F.reg, VENDOR, 8), top - 8, 8, "reg", C.muted);
      this.page.drawLine({ start: { x: M, y: top - 16 }, end: { x: A4[0] - M, y: top - 16 }, thickness: 0.5, color: C.line });
      this.y = top - 34;
    }
  }

  ensure(h) {
    if (this.y - h < BOTTOM) this.newPage();
  }

  text(s, x, y, size, font = "reg", color = C.body) {
    this.page.drawText(s, { x, y, size, font: this.F[font], color });
  }

  logo(x, yTop, s) {
    const u = s / 64;
    this.page.drawSvgPath(roundRect(s, s, 16 * u), { x, y: yTop, color: C.brandDark });
    this.page.drawSvgPath(roundRect(52 * u, 52 * u, 11 * u), { x: x + 6 * u, y: yTop - 6 * u, color: C.white });
    this.page.drawSvgPath(roundRect(34 * u, 34 * u, 7 * u), { x: x + 15 * u, y: yTop - 15 * u, color: C.brand });
  }

  // wrap lays runs out in lines no wider than width. Words in different runs
  // with no space between them stay together.
  wrap(rs, width, size) {
    const groups = [];
    let cur = null;
    for (const r of rs) {
      for (const part of r.t.split(/(\s+)/)) {
        if (part === "") continue;
        if (/^\s+$/.test(part)) { cur = null; continue; }
        if (!cur) { cur = { items: [], w: 0 }; groups.push(cur); }
        const w = textWidth(this.F[r.f], part, size);
        cur.items.push({ s: part, f: r.f, w });
        cur.w += w;
      }
    }
    const space = textWidth(this.F.reg, " ", size);
    const lines = [];
    let line = null;
    for (const g of groups) {
      if (line && line.w + space + g.w <= width) {
        line.groups.push(g);
        line.w += space + g.w;
      } else {
        line = { groups: [g], w: g.w };
        lines.push(line);
      }
    }
    return { lines, space };
  }

  drawLine(line, x, baseline, size, space, color) {
    let cx = x;
    line.groups.forEach((g, i) => {
      if (i) cx += space;
      for (const it of g.items) {
        this.text(it.s, cx, baseline, size, it.f, color);
        cx += it.w;
      }
    });
  }

  para(rs, o = {}) {
    const size = o.size || 9.5;
    const lead = o.lead || size * 1.43;
    const x = o.x || M;
    const width = o.width || CW;
    const labelW = o.labelW || 0;
    const color = o.color || C.body;
    const { lines, space } = this.wrap(rs, width - labelW, size);
    lines.forEach((line, i) => {
      this.ensure(lead);
      const baseline = this.y - (lead + size * 0.7) / 2;
      if (i === 0 && o.label) this.text(o.label, x, baseline, size, "bold", o.labelColor || C.ink);
      this.drawLine(line, x + labelW, baseline, size, space, color);
      this.y -= lead;
    });
    this.y -= o.after === undefined ? 5 : o.after;
  }

  // partHeading starts a part; keep is how much must fit below it, so a
  // heading is never left alone at the foot of a page.
  partHeading(kicker, title, sub, keep = 110) {
    this.ensure(keep);
    this.y -= 10;
    this.text(kicker, M, this.y - 9, 8.5, "bold", C.brand);
    this.text(title, M, this.y - 28, 16, "bold", C.ink);
    this.y -= 36;
    if (sub) this.para(runs(sub), { color: C.muted, after: 2 });
    this.page.drawLine({ start: { x: M, y: this.y - 2 }, end: { x: A4[0] - M, y: this.y - 2 }, thickness: 0.75, color: C.line });
    this.y -= 12;
  }

  heading(label, title, keep = 60) {
    this.ensure(keep);
    this.y -= 4;
    this.text(label, M, this.y - 11, 11, "bold", C.brand);
    this.text(title, M + (label.length > 2 ? 30 : 22), this.y - 11, 11, "bold", C.ink);
    this.y -= 20;
  }

  tip(field, s) {
    field.acroField.dict.set(PDFName.of("TU"), PDFString.of(s));
  }

  unique(name) {
    if (this.names.has(name)) throw new Error("duplicate field name " + name);
    this.names.add(name);
  }

  // fitSize is the largest font size (10 down to 6) at which value fits a
  // box w × h, so a long name is smaller rather than cut off.
  fitSize(value, w, h, multiline) {
    if (!multiline) return fitFontSize(this.F.reg, value, w);
    let size = 9;
    const fits = (s) => {
      let lines = 0;
      for (const p of value.split("\n")) lines += Math.max(1, this.wrap([{ t: p, f: "reg" }], w - 4, s).lines.length);
      return lines * s * 1.2 <= h - 3;
    };
    while (size > 6 && !fits(size)) size -= 0.5;
    return size;
  }

  // fieldRow puts labelled text boxes side by side. A column is a Part A
  // field name, or { label, name, tip, lock } for the signature boxes.
  fieldRow(cols, o = {}) {
    const gutter = 12;
    const h = o.h || 20;
    const x0 = o.x || M;
    const width = o.width || CW;
    this.ensure(13 + h + 9);
    const avail = width - gutter * (cols.length - 1);
    let x = x0;
    for (const col of cols) {
      const c = typeof col === "string" ? { name: col, lock: true, ...FIELDS[col] } : col;
      const w = avail / cols.length;
      this.text(c.label, x, this.y - 8, 7.5, "reg", C.muted);
      this.unique(c.name);
      const tf = this.form.createTextField(c.name);
      tf.addToPage(this.page, {
        x, y: this.y - 12 - h, width: w, height: h,
        textColor: C.ink, backgroundColor: C.fieldBg, borderColor: C.fieldBorder, borderWidth: 0.6,
        font: this.F.reg,
      });
      if (c.multiline) tf.enableMultiline();
      tf.setFontSize(c.multiline ? 9 : 10);
      this.tip(tf, c.tip || c.label);
      const value = this.fill && this.fill.values[c.name];
      if (value) {
        const v = this.safe(value);
        tf.setFontSize(this.fitSize(v, w, h, c.multiline));
        tf.setText(v);
      }
      if (this.fill && c.lock) tf.enableReadOnly();
      x += w + gutter;
    }
    this.y -= 13 + h + 9;
  }

  // radioList is a choose-one list, one option a line.
  radioList(name, options, tip) {
    const row = 19;
    this.ensure(row * options.length + 6);
    this.unique(name);
    const rg = this.form.createRadioGroup(name);
    for (const opt of options) {
      const baseline = this.y - 13;
      rg.addOptionToPage(opt.value, this.page, {
        x: M, y: baseline - 2, width: 11, height: 11,
        textColor: C.brand, backgroundColor: C.white, borderColor: C.fieldBorder, borderWidth: 0.8,
      });
      this.text(opt.value, M + 19, baseline, 10, "bold", C.ink);
      const tw = textWidth(this.F.bold, opt.value, 10);
      this.text(opt.desc, M + 19 + Math.max(tw + 10, 76), baseline, 9.5, "reg", C.body);
      this.y -= row;
    }
    this.tip(rg, tip);
    if (this.fill) {
      if (this.fill.values[name]) rg.select(this.fill.values[name]);
      rg.enableReadOnly();
    }
    this.y -= 6;
  }

  // stepsBox draws a tinted panel around numbered steps; the content is
  // measured first so the panel never splits across pages.
  stepsBox(title, steps, note) {
    const pad = 14;
    const size = 9.5;
    const lead = size * 1.43;
    const inner = CW - 2 * pad - 4;
    const labelW = 16;
    const measured = steps.map(([n, s]) => ({ n, ...this.wrap(runs(s), inner - labelW, size) }));
    const noteWrap = this.wrap([{ t: note, f: "reg" }], inner, 8.5);
    let h = pad + 16;
    for (const m of measured) h += m.lines.length * lead + 4;
    h += 4 + noteWrap.lines.length * 8.5 * 1.43 + pad;
    this.ensure(h + 8);
    const top = this.y;
    this.page.drawRectangle({ x: M, y: top - h, width: CW, height: h, color: C.soft });
    this.page.drawRectangle({ x: M, y: top - h, width: 3, height: h, color: C.brand });
    const x = M + pad + 4;
    let y = top - pad;
    this.text(title, x, y - 9, 10.5, "bold", C.ink);
    y -= 16;
    for (const m of measured) {
      m.lines.forEach((line, i) => {
        const baseline = y - (lead + size * 0.7) / 2;
        if (i === 0) this.text(m.n + ".", x, baseline, size, "bold", C.brand);
        this.drawLine(line, x + labelW, baseline, size, m.space, C.body);
        y -= lead;
      });
      y -= 4;
    }
    y -= 4;
    noteWrap.lines.forEach((line) => {
      this.drawLine(line, x, y - (8.5 * 1.43 + 8.5 * 0.7) / 2, 8.5, noteWrap.space, C.muted);
      y -= 8.5 * 1.43;
    });
    this.y = top - h - 14;
  }

  footers() {
    const n = this.pages.length;
    this.pages.forEach((p, i) => {
      this.page = p;
      p.drawLine({ start: { x: M, y: 44 }, end: { x: A4[0] - M, y: 44 }, thickness: 0.5, color: C.line });
      this.text(`Unda Media Server Licence Agreement · Version ${VERSION} · ${DATE} · undamedia.com · ${EMAIL}`, M, 31, 7.5, "reg", C.muted);
      const pg = `Page ${i + 1} of ${n}`;
      this.text(pg, A4[0] - M - textWidth(this.F.reg, pg, 7.5), 31, 7.5, "reg", C.muted);
    });
  }
}

// buildContract returns the agreement as PDF bytes. Without fill it is the
// blank form. With fill = { values: { <field name>: text, package, hosting,
// customer_sign_name, … }, record }, the buyer's boxes are filled in and
// locked, and record (when signed and from where) is printed under their
// signature.
export async function buildContract(fill) {
  const pdf = await PDFDocument.create();
  const fonts = {
    reg: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
  };
  pdf.setTitle("Unda Media Server Licence Agreement", { showInWindowTitleBar: true });
  pdf.setAuthor("LC Technology");
  pdf.setSubject("Licence agreement for Unda Media Server: order form, terms and signatures");
  pdf.setKeywords(["Unda Media Server", "UndaMedia", "licence agreement", "LC Technology"]);
  pdf.setCreator("UndaMedia");
  pdf.setProducer("UndaMedia");
  pdf.setLanguage("en-GB");
  if (fill) {
    // A fixed date keeps the file the same for the same answers; the record
    // line carries when it was signed.
    pdf.setCreationDate(new Date(fill.signedAt || Date.now()));
    pdf.setModificationDate(new Date(fill.signedAt || Date.now()));
  }

  const L = new Layout(pdf, fonts, fill);

  // Masthead.
  L.logo(M, L.y, 26);
  L.text("UndaMedia", M + 34, L.y - 17, 14, "bold", C.ink);
  const ver = `Version ${VERSION} · ${DATE}`;
  L.text(ver, A4[0] - M - textWidth(fonts.reg, ver, 8.5), L.y - 16, 8.5, "reg", C.muted);
  L.y -= 52;
  L.text("Unda Media Server", M, L.y - 12, 12, "bold", C.brand);
  L.text("Licence Agreement", M, L.y - 38, 26, "bold", C.ink);
  L.y -= 54;
  L.para(runs(INTRO), { size: 10, after: 12 });
  L.stepsBox("How to buy with this form", STEPS, PAPER);

  // Part A.
  L.partHeading("PART A", "What you are buying", "Fill in this part. Copy the package and fees from our quote.");
  L.heading("A1", "Your organisation");
  L.fieldRow(["customer_name"]);
  L.fieldRow(["customer_reg_no", "customer_country"]);
  L.fieldRow(["customer_address"], { h: 34 });
  L.fieldRow(["contact_name", "contact_title"]);
  L.fieldRow(["contact_email", "contact_phone"]);
  L.fieldRow(["billing_email"]);

  L.heading("A2", "Package", 120);
  L.para(runs("Choose one. The packages are described at undamedia.com/packages."), { color: C.muted, after: 4 });
  L.radioList("package", PACKAGES, "Package (choose one)");
  L.fieldRow(["custom_streams", "custom_members"]);
  L.fieldRow(["custom_tools"]);

  L.heading("A3", "How Unda runs", 90);
  L.radioList("hosting", HOSTING, "How Unda runs (choose one)");
  L.fieldRow(["domains"]);

  L.heading("A4", "Term and fees", 120);
  L.fieldRow(["quote_number", "start_date", "licence_term"]);
  L.fieldRow(["licence_fee", "currency", "billing_period"]);
  L.fieldRow(["hosting_fee", "payment_days"]);

  L.heading("A5", "Anything else we agreed", 100);
  L.fieldRow(["special_terms"], { h: 64 });

  // Part B.
  L.newPage();
  L.partHeading("PART B", "Terms", "These terms apply to every licence of Unda Media Server.");
  for (const [n, title, items] of TERMS) {
    L.heading(n, title, 70);
    for (const [label, s] of items) L.para(runs(s), { label, labelW: 30, after: 4 });
    L.y -= 4;
  }

  // Part C.
  L.partHeading("PART C", "Signatures", SIGN_INTRO, 340);
  const half = (CW - 24) / 2;
  const colX = [M, M + half + 24];
  L.para([{ t: "For the customer", f: "bold" }], { x: colX[0], width: half, size: 10.5, color: C.ink, after: 0 });
  L.y += 10.5 * 1.43;
  L.para([{ t: "For " + VENDOR, f: "bold" }], { x: colX[1], width: half, size: 10.5, color: C.ink, after: 0 });
  L.para([{ t: "We complete this side.", f: "reg" }], { x: colX[1], width: half, size: 8.5, color: C.muted, after: 6 });
  const sides = [["customer", "Customer", true], ["vendor", "LC Technology", false]];
  for (const [label, key, h] of [["Name", "name", 20], ["Job title", "title", 20], ["Signature (type your full name, or sign)", "signature", 36], ["Date", "date", 20]]) {
    const y = L.y;
    sides.forEach(([side, who, lock], i) => {
      L.y = y;
      L.fieldRow([{ label, name: `${side}_sign_${key}`, tip: `${who}: ${label}`, lock }], { x: colX[i], width: half, h });
    });
  }
  const afterFields = L.y;
  if (fill && fill.record) {
    L.para([{ t: L.safe(fill.record), f: "reg" }], { x: colX[0], width: half, size: 8, color: C.muted, after: 0 });
  }
  const leftY = L.y;
  L.y = afterFields;
  const reg = [VENDOR_ADDRESS && `Registered address: ${VENDOR_ADDRESS}`, VENDOR_REG_NO && `Registration number: ${VENDOR_REG_NO}`].filter(Boolean);
  for (const line of reg) L.para([{ t: line, f: "reg" }], { x: colX[1], width: half, size: 8.5, color: C.muted, after: 0 });
  L.y = Math.min(L.y, leftY) - 10;
  L.para(runs(fill
    ? `We check it, sign our side and email it back to you with your invoice. Questions: **${EMAIL}**.`
    : `Save the file and email it to **${EMAIL}**. We sign it and send a copy back to you.`), { size: 9.5, after: 0 });

  L.footers();
  formFont(pdf, fonts.reg);
  return pdf.save();
}

// Our side of Part C, in the order the boxes appear.
const OUR_BOXES = ["vendor_sign_name", "vendor_sign_title", "vendor_sign_signature", "vendor_sign_date"];

// countersign signs our side of an agreement the buyer has signed (the PDF
// from the order page, or the blank one they filled in): it types our name,
// job title, signature and date into our four boxes in Part C, where they
// are, so nothing on any page moves, and locks every box. Typing a name
// counts as signing (Part B, 11.8). It refuses a PDF that is not this
// agreement, or whose side is already signed. Returns the new PDF's bytes.
export async function countersign(bytes, { name, title, date, signature }, at = new Date()) {
  let pdf;
  try {
    pdf = await PDFDocument.load(bytes);
  } catch {
    throw new Error("This file could not be read as a PDF.");
  }
  const form = pdf.getForm();
  const box = (n) => {
    try {
      return form.getTextField(n);
    } catch {
      throw new Error("This is not an Unda licence agreement with its boxes (no “" + n + "”). If it was printed or scanned, sign the paper copy instead.");
    }
  };
  const boxes = OUR_BOXES.map(box);
  if (boxes.some((b) => (b.getText() || "").trim())) throw new Error("Our side of Part C is already filled in.");
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const charset = new Set(font.getCharacterSet());
  const values = [name, title, signature || name, date].map((v) => safeText(charset, String(v || "").replace(/\s+/g, " ").trim()));
  if (!values[0] || !values[1] || !values[3]) throw new Error("Give our signer's name, job title and the date.");
  boxes.forEach((b, i) => {
    const w = b.acroField.getWidgets()[0].getRectangle().width;
    b.setFontSize(fitFontSize(font, values[i], w));
    b.setText(values[i]);
    b.updateAppearances(font);
  });
  for (const f of form.getFields()) f.enableReadOnly();
  formFont(pdf, font);
  pdf.setModificationDate(at);
  return pdf.save({ updateFieldAppearances: false });
}
