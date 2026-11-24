import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";
import { writeLLMFiles } from "./llms";
import { TRANSLATED } from "./translated";

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

const SITE = "https://www.undamedia.com";

const ORGANIZATION = {
  "@type": "Organization",
  name: "UndaMedia",
  url: `${SITE}/`,
  logo: `${SITE}/favicon.svg`,
  email: "support@undamedia.com",
  sameAs: ["https://www.youtube.com/@undamediaserver"],
};

// The section a page sits in, for its breadcrumb trail (Home > Section > Page).
const SECTIONS: Record<string, { name: string; url: string }> = {
  features: { name: "Features", url: `${SITE}/features/` },
  solutions: { name: "Solutions", url: `${SITE}/solutions/` },
  blog: { name: "Blog", url: `${SITE}/blog/` },
  guide: { name: "Guide", url: `${SITE}/guide/introduction` },
  reference: { name: "Reference", url: `${SITE}/reference/api` },
};

// schema.org data for a page: the organisation and website on the home page,
// an article on blog posts, a breadcrumb trail on pages inside a section.
function structuredData(path: string, url: string, pageData: any, description: string): object[] {
  if (path === "") {
    return [ORGANIZATION, { "@type": "WebSite", name: "UndaMedia", url: `${SITE}/` }];
  }
  if (path === "fr/") {
    return [ORGANIZATION, { "@type": "WebSite", name: "UndaMedia", url, inLanguage: "fr" }];
  }
  const out: object[] = [];
  const section = SECTIONS[path.split("/")[0]];
  if (section) {
    const trail = [{ name: "Home", url: `${SITE}/` }, section];
    if (url !== section.url) trail.push({ name: pageData.title, url });
    out.push({
      "@type": "BreadcrumbList",
      itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: t.url })),
    });
  }
  if (pageData.frontmatter.date) {
    out.push({
      "@type": "BlogPosting",
      headline: pageData.title,
      description,
      image: `${SITE}/og.jpg`,
      datePublished: pageData.frontmatter.date,
      ...(pageData.lastUpdated ? { dateModified: new Date(pageData.lastUpdated).toISOString() } : {}),
      mainEntityOfPage: url,
      author: ORGANIZATION,
      publisher: ORGANIZATION,
    });
  }
  return out;
}

// The docs' sidebar, shown on the guides, the reference and the release notes.
const docsSidebar = [
  {
    text: "Getting started",
    items: [
      { text: "What is Unda?", link: "/guide/introduction" },
      { text: "A tour of the dashboard", link: "/guide/dashboard" },
      { text: "Ways to earn with Unda", link: "/guide/earning" },
      { text: "What works with Unda", link: "/guide/compatibility" },
      { text: "Test results", link: "/guide/test-results" },
      { text: "Releases and support", link: "/guide/releases" },
      { text: "Install", link: "/guide/install" },
      { text: "Unda on Windows", link: "/guide/windows" },
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
      { text: "Channel inputs (failover)", link: "/guide/channel-inputs" },
      { text: "Backup encoder", link: "/guide/backup-encoder" },
      { text: "24/7 channels (playout)", link: "/guide/playout" },
      { text: "Restreaming", link: "/guide/restreaming" },
      { text: "SRT", link: "/guide/srt" },
      { text: "WebRTC (low latency)", link: "/guide/webrtc" },
      { text: "UDP / MPEG-TS", link: "/guide/udp" },
      { text: "Broadcast encoders (IP)", link: "/guide/broadcast-encoders" },
      { text: "Pull inputs (HLS, RTSP…)", link: "/guide/pull-inputs" },
      { text: "Multi-channel (MPTS)", link: "/guide/mpts" },
      { text: "Relays", link: "/guide/relays" },
      { text: "Stream analyser", link: "/guide/analyser" },
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

// Remembers the language a visitor picks in the language menu (in their own
// browser, localStorage "unda_lang"), and on a later visit from outside the site
// opens the page in that language when it has one. Inline in <head>, so the
// page switches before it is drawn. Search engines carry no stored choice.
const LANGUAGE_SCRIPT = `(function(){try{
document.addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest(".VPNavBarTranslations a,.VPNavScreenTranslations a");if(!a)return;var h=a.getAttribute("href")||"";try{localStorage.setItem("unda_lang",/^\\/fr(\\/|$)/.test(h)?"fr":"en")}catch(x){}},true);
var want=localStorage.getItem("unda_lang");if(want!=="fr"&&want!=="en")return;
if(document.referrer){try{if(new URL(document.referrer).origin===location.origin)return}catch(x){}}
var p=decodeURI(location.pathname).replace(/\\.html$/,"").replace(/^\\/+/,"");
var fr=p==="fr"||p.indexOf("fr/")===0;if((want==="fr")===fr)return;
var key=(fr?p.replace(/^fr\\/?/,""):p).replace(/(^|\\/)index$/,"$1");
var T=${JSON.stringify([...TRANSLATED])};
if(T.indexOf(key)<0){if(T.indexOf(key+"/")<0)return;key+="/"}
location.replace((want==="fr"?"/fr/":"/")+key+location.search+location.hash);
}catch(x){}})();`;

const DESCRIPTION =
  "Unda Media Server: the live streaming and broadcast server you run on your own server. RTMP, SRT, HLS, adaptive bitrate, recording, restreaming and 24/7 channels, with a dashboard for your team.";

const YOUTUBE_ICON =
  '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>YouTube</title><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>';

// The French site (/fr/). Only some pages are translated (translated.ts);
// the menus link to the English page where there is no French one yet, and
// say so with "En anglais".
const DESCRIPTION_FR =
  "Unda Media Server : le serveur de diffusion en direct que vous installez sur votre propre serveur. RTMP, SRT, HLS, débit adaptatif, enregistrement, rediffusion et chaînes 24h/24, avec un tableau de bord pour votre équipe.";

// The French docs' sidebar: the same pages as docsSidebar, in French; the
// reference stays English.
const frDocsSidebar = [
  {
    text: "Pour commencer",
    items: [
      { text: "Qu'est-ce qu'Unda ?", link: "/fr/guide/introduction" },
      { text: "Une visite du tableau de bord", link: "/fr/guide/dashboard" },
      { text: "Gagner de l'argent avec Unda", link: "/fr/guide/earning" },
      { text: "Ce qui fonctionne avec Unda", link: "/fr/guide/compatibility" },
      { text: "Résultats des tests", link: "/fr/guide/test-results" },
      { text: "Versions et assistance", link: "/fr/guide/releases" },
      { text: "Installer", link: "/fr/guide/install" },
      { text: "Unda sous Windows", link: "/fr/guide/windows" },
      { text: "Diffuser depuis OBS, vMix ou ffmpeg", link: "/fr/guide/streaming" },
      { text: "Regarder et intégrer", link: "/fr/guide/watching" },
      { text: "Liens de lecture signés", link: "/fr/guide/protect-playback" },
    ],
  },
  {
    text: "Au quotidien",
    items: [
      { text: "Comptes et chaînes", link: "/fr/guide/accounts" },
      { text: "Débit adaptatif", link: "/fr/guide/transcoding" },
      { text: "Enregistrement", link: "/fr/guide/recording" },
      { text: "Entrées de chaîne (secours)", link: "/fr/guide/channel-inputs" },
      { text: "Encodeur de secours", link: "/fr/guide/backup-encoder" },
      { text: "Chaînes 24h/24 (diffusion)", link: "/fr/guide/playout" },
      { text: "Rediffusion", link: "/fr/guide/restreaming" },
      { text: "SRT", link: "/fr/guide/srt" },
      { text: "WebRTC (faible délai)", link: "/fr/guide/webrtc" },
      { text: "UDP / MPEG-TS", link: "/fr/guide/udp" },
      { text: "Encodeurs broadcast (IP)", link: "/fr/guide/broadcast-encoders" },
      { text: "Entrées récupérées (HLS, RTSP…)", link: "/fr/guide/pull-inputs" },
      { text: "Multi-chaînes (MPTS)", link: "/fr/guide/mpts" },
      { text: "Relais", link: "/fr/guide/relays" },
      { text: "Analyseur de flux", link: "/fr/guide/analyser" },
      { text: "Surveillance et alertes", link: "/fr/guide/monitoring" },
      { text: "Licence", link: "/fr/guide/license" },
      { text: "Dépannage", link: "/fr/guide/troubleshooting" },
    ],
  },
  {
    text: "Référence (en anglais)",
    items: [
      { text: "API REST", link: "/reference/api" },
      { text: "Fichier de configuration", link: "/reference/config" },
      { text: "Caddy en frontal", link: "/reference/caddy" },
    ],
  },
];

const frTheme = {
  nav: [
    {
      text: "Serveur média",
      activeMatch: "^/fr/(media-server|features)",
      items: [
        { text: "Présentation", link: "/fr/media-server" },
        {
          text: "Fonctionnalités",
          items: [
            { text: "Rediffusion", link: "/fr/features/restreaming" },
            { text: "Chaînes 24h/24", link: "/fr/features/24-7-channels" },
            { text: "Encodeur de secours", link: "/fr/features/backup-encoder" },
            { text: "Débit adaptatif", link: "/fr/features/adaptive-bitrate" },
            { text: "Enregistrement", link: "/fr/features/recording" },
            { text: "Liens de lecture signés", link: "/fr/features/signed-links" },
            { text: "Sorties TV et IPTV", link: "/fr/features/tv-outputs" },
            { text: "Surveillance et alertes", link: "/fr/features/monitoring" },
          ],
        },
      ],
    },
    {
      text: "Solutions",
      activeMatch: "^/fr/solutions",
      items: [
        { text: "Églises et ministères", link: "/fr/solutions/churches" },
        { text: "Chaînes de télévision sur Internet", link: "/fr/solutions/internet-tv" },
        { text: "Sociétés de production", link: "/fr/solutions/production-companies" },
        { text: "Opérateurs IPTV et diffuseurs", link: "/fr/solutions/iptv-operators" },
      ],
    },
    { text: "Offres", link: "/fr/packages" },
    {
      text: "Ressources",
      activeMatch: "^/(fr/guide|fr/blog|fr/glossary|guide|reference|release-notes|blog|glossary)",
      items: [
        {
          text: "Documentation",
          items: [
            { text: "Le guide", link: "/fr/guide/introduction" },
            { text: "Installer Unda", link: "/fr/guide/install" },
            { text: "Blog", link: "/fr/blog/" },
            { text: "Glossaire", link: "/fr/glossary" },
          ],
        },
        {
          text: "En anglais",
          items: [
            { text: "Référence de l'API", link: "/reference/api" },
            { text: "Notes de version", link: "/release-notes" },
          ],
        },
      ],
    },
    { text: "À propos", link: "/fr/about" },
    { text: "Contact", link: "/fr/contact" },
  ],
  socialLinks: [{ icon: { svg: YOUTUBE_ICON }, link: "https://www.youtube.com/@undamediaserver", ariaLabel: "Unda Media Server sur YouTube" }],
  sidebar: {
    "/fr/guide/": frDocsSidebar,
  },
  footer: {
    message:
      '<a href="/fr/media-server">Serveur média</a> · <a href="/fr/features/">Fonctionnalités</a> · <a href="/fr/solutions/">Solutions</a> · <a href="/fr/packages">Offres</a> · <a href="/fr/guide/install">Installer</a> · <a href="/fr/guide/introduction">Documentation</a> · <a href="/fr/blog/">Blog</a> · <a href="/fr/about">À propos</a> · <a href="/fr/brand">Marque</a> · <a href="/fr/contact">Contact</a> · <a href="/fr/security">Sécurité</a> · <a href="/fr/privacy">Confidentialité</a> · <a href="/fr/disclaimer">Avertissement</a> · <a href="mailto:support@undamedia.com">support@undamedia.com</a>',
    copyright: "Unda Media Server est un logiciel propriétaire. © 2026 LocalCode Technology. Tous droits réservés.",
  },
  outline: { level: [2, 3], label: "Sur cette page" },
  docFooter: { prev: "Page précédente", next: "Page suivante" },
  lastUpdated: { text: "Mis à jour le" },
  darkModeSwitchLabel: "Apparence",
  lightModeSwitchTitle: "Passer au thème clair",
  darkModeSwitchTitle: "Passer au thème sombre",
  sidebarMenuLabel: "Menu",
  returnToTopLabel: "Retour en haut",
  langMenuLabel: "Changer de langue",
  skipToContentLabel: "Aller au contenu",
  notFound: {
    title: "PAGE INTROUVABLE",
    quote: "Cette page n'existe pas, ou pas encore en français.",
    linkLabel: "aller à l'accueil",
    linkText: "Retour à l'accueil",
  },
};

const frSearch = {
  translations: {
    button: { buttonText: "Rechercher", buttonAriaLabel: "Rechercher" },
    modal: {
      displayDetails: "Afficher les détails",
      resetButtonTitle: "Effacer la recherche",
      backButtonTitle: "Fermer la recherche",
      noResultsText: "Aucun résultat pour",
      footer: {
        selectText: "choisir",
        selectKeyAriaLabel: "Entrée",
        navigateText: "parcourir",
        navigateUpKeyAriaLabel: "flèche vers le haut",
        navigateDownKeyAriaLabel: "flèche vers le bas",
        closeText: "fermer",
        closeKeyAriaLabel: "Échap",
      },
    },
  },
};

export default defineConfig({
  title: "UndaMedia",
  description: DESCRIPTION,
  lang: "en",
  locales: {
    root: { label: "English", lang: "en" },
    fr: { label: "Français", lang: "fr", link: "/fr/", description: DESCRIPTION_FR, themeConfig: frTheme },
  },
  // The language switch: our own links (theme/langs.ts) in place of VitePress's,
  // which point at the same page in the other language even when it isn't translated.
  vite: {
    resolve: {
      alias: [{ find: /^\.{1,2}\/composables\/langs(\.js)?$/, replacement: fileURLToPath(new URL("./theme/langs.ts", import.meta.url)) }],
    },
  },
  // shared/ holds copies of repository files that pages include; not pages themselves.
  srcExclude: ["shared/**", "README.md"],
  cleanUrls: true,
  sitemap: { hostname: SITE },
  lastUpdated: true,
  // Light first; dark is available from the switch in the top bar.
  appearance: { initialValue: "light" } as any,
  head: [
    ["script", {}, LANGUAGE_SCRIPT],
    ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
    // Visit counts: Vercel Web Analytics (no cookies; the privacy page says so).
    ["script", {}, "window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };"],
    ["script", { defer: "", src: "/_vercel/insights/script.js" }],
    // The whole site as one plain-text file, for AI assistants.
    ["link", { rel: "alternate", type: "text/plain", title: "The whole site as plain text", href: "/llms-full.txt" }],
    // The picture shown when a link is shared (WhatsApp, Facebook, X, LinkedIn…).
    ["meta", { property: "og:site_name", content: "UndaMedia" }],
    ["meta", { property: "og:image", content: `${SITE}/og.jpg` }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    ["meta", { property: "og:image:alt", content: "UndaMedia: your own live streaming platform, with the Unda dashboard" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:site", content: "@undamedia" }],
  ],
  // llms.txt and llms-full.txt for AI assistants: the site in one file, made
  // from the same sources as the pages (see llms.ts).
  buildEnd(site) {
    writeLLMFiles(site.srcDir, site.outDir, site.pages, {
      site: SITE,
      title: "Unda Media Server",
      description: DESCRIPTION,
      sidebar: docsSidebar,
      repoLinks,
    });
  },
  // Each page's own title, description and address in its link preview,
  // and structured data for search engines (schema.org JSON-LD).
  transformHead({ pageData, title, description }) {
    // The 404 page is also served at /404 with status 200: keep it out of search.
    if (pageData.isNotFound) return [["meta", { name: "robots", content: "noindex" }]];
    const path = pageData.relativePath.replace(/(^|\/)index\.md$/, "$1").replace(/\.md$/, "");
    const url = `${SITE}/${path}`;
    // A page that exists in both languages names both, for search engines.
    const french = path === "fr/" || path.startsWith("fr/");
    const english = french ? path.replace(/^fr\/?/, "") : path;
    const languages = TRANSLATED.has(english)
      ? [
          ["link", { rel: "alternate", hreflang: "en", href: `${SITE}/${english}` }],
          ["link", { rel: "alternate", hreflang: "fr", href: `${SITE}/fr/${english}` }],
          ["link", { rel: "alternate", hreflang: "x-default", href: `${SITE}/${english}` }],
        ]
      : [];
    return [
      ["meta", { property: "og:locale", content: french ? "fr_FR" : "en_GB" }],
      ...(languages as any),
      ["meta", { property: "og:type", content: pageData.frontmatter.date ? "article" : "website" }],
      ["meta", { property: "og:title", content: title }],
      ["meta", { property: "og:description", content: description }],
      ["meta", { property: "og:url", content: url }],
      ["link", { rel: "canonical", href: url }],
      ...structuredData(path, url, pageData, description).map(
        (d) => ["script", { type: "application/ld+json" }, JSON.stringify({ "@context": "https://schema.org", ...d }).replace(/</g, "\\u003c")] as any,
      ),
    ];
  },
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
      {
        text: "Media Server",
        activeMatch: "^/(media-server|features)",
        items: [
          { text: "Overview", link: "/media-server" },
          {
            text: "Features",
            items: [
              { text: "Restreaming", link: "/features/restreaming" },
              { text: "24/7 channels", link: "/features/24-7-channels" },
              { text: "Backup encoder", link: "/features/backup-encoder" },
              { text: "Adaptive bitrate", link: "/features/adaptive-bitrate" },
              { text: "Recording", link: "/features/recording" },
              { text: "Signed playback links", link: "/features/signed-links" },
              { text: "TV and IPTV outputs", link: "/features/tv-outputs" },
              { text: "Monitoring and alerts", link: "/features/monitoring" },
            ],
          },
        ],
      },
      {
        text: "Solutions",
        activeMatch: "^/solutions",
        items: [
          { text: "Churches and ministries", link: "/solutions/churches" },
          { text: "Internet TV channels", link: "/solutions/internet-tv" },
          { text: "Production companies", link: "/solutions/production-companies" },
          { text: "IPTV operators and broadcasters", link: "/solutions/iptv-operators" },
        ],
      },
      { text: "Packages", link: "/packages" },
      {
        text: "Resources",
        activeMatch: "^/(guide|reference|release-notes|blog|glossary)",
        items: [
          {
            text: "Docs",
            items: [
              { text: "Guide", link: "/guide/introduction" },
              { text: "Install", link: "/guide/install" },
              { text: "API reference", link: "/reference/api" },
              { text: "Release notes", link: "/release-notes" },
            ],
          },
          {
            text: "Learn",
            items: [
              { text: "Blog", link: "/blog/" },
              { text: "Glossary", link: "/glossary" },
            ],
          },
        ],
      },
      { text: "About", link: "/about" },
      { text: "Contact", link: "/contact" },
    ],
    // Inline icons: VitePress would otherwise load them from another website.
    socialLinks: [{ icon: { svg: YOUTUBE_ICON }, link: "https://www.youtube.com/@undamediaserver", ariaLabel: "Unda Media Server on YouTube" }],
    // Only the docs have a sidebar; the site's own pages (home, Media Server,
    // Packages, About, Contact) are full width.
    sidebar: { "/guide/": docsSidebar, "/reference/": docsSidebar, "/release-notes": docsSidebar },
    search: { provider: "local", options: { locales: { fr: frSearch } } },
    outline: { level: [2, 3] },
    // Shown on pages without a sidebar (the site's own pages, not the guides).
    footer: {
      message:
        '<a href="/media-server">Media Server</a> · <a href="/features/">Features</a> · <a href="/solutions/">Solutions</a> · <a href="/packages">Packages</a> · <a href="/guide/introduction">Docs</a> · <a href="/blog/">Blog</a> · <a href="/about">About</a> · <a href="/brand">Brand</a> · <a href="/contact">Contact</a> · <a href="/security">Security</a> · <a href="/privacy">Privacy</a> · <a href="/disclaimer">Disclaimer</a> · <a href="mailto:support@undamedia.com">support@undamedia.com</a>',
      copyright: "Unda Media Server is proprietary software. © 2026 LocalCode Technology. All rights reserved.",
    },
  },
});
