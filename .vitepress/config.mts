import { defineConfig } from "vitepress";

// GitHub's heading anchors ("## 8. Backups and upgrades" -> #8-backups-and-upgrades),
// so the table of contents inside deploy/INSTALL.md, which is included as-is,
// works here the same as on GitHub and in the release folder.
function githubSlug(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");
}

// Links in the included repository files that point at files, not pages.
const repoLinks: Record<string, string> = {
  "caddy/": "/reference/caddy",
};

// The docs' sidebar, shown on the guides, the reference and the release notes.
const docsSidebar = [
  {
    text: "Getting started",
    items: [
      { text: "What is Unda?", link: "/guide/introduction" },
      { text: "A tour of the dashboard", link: "/guide/dashboard" },
      { text: "Ways to earn with Unda", link: "/guide/earning" },
      { text: "What works with Unda", link: "/guide/compatibility" },
      { text: "Install", link: "/guide/install" },
      { text: "Stream from OBS, vMix or ffmpeg", link: "/guide/streaming" },
      { text: "Watching and embedding", link: "/guide/watching" },
      { text: "Signed playback links", link: "/guide/protect-playback" },
    ],
  },
  {
    text: "Running it",
    items: [
      { text: "Accounts and channels", link: "/guide/accounts" },
      { text: "Adaptive bitrate", link: "/guide/transcoding" },
      { text: "Recording", link: "/guide/recording" },
      { text: "Backup encoder (failover)", link: "/guide/backup-encoder" },
      { text: "24/7 channels (playout)", link: "/guide/playout" },
      { text: "Restreaming", link: "/guide/restreaming" },
      { text: "SRT", link: "/guide/srt" },
      { text: "UDP / MPEG-TS", link: "/guide/udp" },
      { text: "Multi-channel (MPTS)", link: "/guide/mpts" },
      { text: "Monitoring and alerts", link: "/guide/monitoring" },
      { text: "License", link: "/guide/license" },
      { text: "Troubleshooting", link: "/guide/troubleshooting" },
    ],
  },
  {
    text: "Reference",
    items: [
      { text: "REST API", link: "/reference/api" },
      { text: "Configuration file", link: "/reference/config" },
      { text: "Caddy in front", link: "/reference/caddy" },
    ],
  },
];

export default defineConfig({
  title: "UndaMedia",
  description: "Unda Media Server: the live streaming and broadcast server you run on your own server. RTMP, SRT, HLS, adaptive bitrate, recording, restreaming and 24/7 channels, with a dashboard for your team.",
  lang: "en",
  // shared/ holds copies of repository files that pages include; not pages themselves.
  srcExclude: ["shared/**", "README.md"],
  cleanUrls: true,
  sitemap: { hostname: "https://www.undamedia.com" },
  lastUpdated: true,
  // Light first; dark is available from the switch in the top bar.
  appearance: { initialValue: "light" } as any,
  head: [["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }]],
  markdown: {
    anchor: { slugify: githubSlug },
    config: (md) => {
      const open = md.renderer.rules.link_open ?? ((t, i, o, _e, self) => self.renderToken(t, i, o));
      md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        const href = tokens[idx].attrGet("href");
        if (href && repoLinks[href]) tokens[idx].attrSet("href", repoLinks[href]);
        return open(tokens, idx, options, env, self);
      };
    },
  },
  themeConfig: {
    logo: { src: "/favicon.svg", alt: "" },
    siteTitle: "UndaMedia",
    nav: [
      { text: "Media Server", link: "/media-server" },
      { text: "Packages", link: "/packages" },
      {
        text: "Docs",
        activeMatch: "^/(guide|reference|release-notes)",
        items: [
          { text: "Guide", link: "/guide/introduction" },
          { text: "Install", link: "/guide/install" },
          { text: "API reference", link: "/reference/api" },
          { text: "Release notes", link: "/release-notes" },
        ],
      },
      { text: "About", link: "/about" },
      { text: "Contact", link: "/contact" },
    ],
    // Inline icons: VitePress would otherwise load them from another website.
    socialLinks: [
      {
        icon: { svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Facebook</title><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>' },
        link: "https://www.facebook.com/undamedia",
        ariaLabel: "UndaMedia on Facebook",
      },
      {
        icon: { svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>' },
        link: "https://x.com/undamedia",
        ariaLabel: "UndaMedia on X",
      },
    ],
    // Only the docs have a sidebar; the site's own pages (home, Media Server,
    // Packages, About, Contact) are full width.
    sidebar: { "/guide/": docsSidebar, "/reference/": docsSidebar, "/release-notes": docsSidebar },
    search: { provider: "local" },
    outline: { level: [2, 3] },
    // Shown on pages without a sidebar (the site's own pages, not the guides).
    footer: {
      message:
        '<a href="/media-server">Media Server</a> · <a href="/packages">Packages</a> · <a href="/guide/introduction">Docs</a> · <a href="/about">About</a> · <a href="/contact">Contact</a> · <a href="mailto:support@undamedia.com">support@undamedia.com</a>',
      copyright: "Unda Media Server is proprietary software. © 2026 LocalCode Technology. All rights reserved.",
    },
  },
});
