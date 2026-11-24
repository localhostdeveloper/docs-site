// Pages that exist in French as well as in English, by their English path
// ("" = the home page). The language switch goes to the same page in the
// other language when it is listed here, and to that language's home page
// otherwise; the page head lists both versions for search engines. Add a
// page here when its French copy (docs-site/fr/<path>.md) is written.
export const TRANSLATED = new Set([
  "", "packages", "guide/install", "media-server", "about", "contact", "security",
  "features/", "features/restreaming", "features/24-7-channels", "features/backup-encoder", "features/adaptive-bitrate",
  "features/recording", "features/signed-links", "features/tv-outputs", "features/monitoring",
  "solutions/", "solutions/churches", "solutions/internet-tv", "solutions/production-companies", "solutions/iptv-operators",
]);
