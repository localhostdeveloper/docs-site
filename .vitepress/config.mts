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

export default defineConfig({
  title: "Unda Media Server",
  description: "Self-hosted live streaming server: RTMP, SRT and HLS, with a dashboard, channels and accounts.",
  lang: "en",
  // shared/ holds copies of repository files that pages include; not pages themselves.
  srcExclude: ["shared/**", "README.md"],
  cleanUrls: true,
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
    siteTitle: "Unda",
    nav: [
      { text: "Guide", link: "/guide/introduction" },
      { text: "Install", link: "/guide/install" },
      { text: "Reference", link: "/reference/api" },
      { text: "Release notes", link: "/release-notes" },
    ],
    sidebar: [
      {
        text: "Getting started",
        items: [
          { text: "What is Unda?", link: "/guide/introduction" },
          { text: "Install", link: "/guide/install" },
          { text: "Stream from OBS, vMix or ffmpeg", link: "/guide/streaming" },
          { text: "Watching and embedding", link: "/guide/watching" },
        ],
      },
      {
        text: "Running it",
        items: [
          { text: "Accounts and channels", link: "/guide/accounts" },
          { text: "Adaptive bitrate", link: "/guide/transcoding" },
          { text: "Recording", link: "/guide/recording" },
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
    ],
    search: { provider: "local" },
    outline: { level: [2, 3] },
    footer: { message: "Unda Media Server" },
  },
});
