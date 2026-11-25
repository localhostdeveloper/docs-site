// Pages that exist in French as well as in English, by their English path
// ("" = the home page). The language switch goes to the same page in the
// other language when it is listed here, and to that language's home page
// otherwise; the page head lists both versions for search engines. Add a
// page here when its French copy (docs-site/fr/<path>.md) is written.
export const TRANSLATED = new Set([
  "", "packages", "guide/install", "media-server", "about", "contact",
  "features/", "features/restreaming", "features/24-7-channels", "features/backup-encoder", "features/adaptive-bitrate",
  "features/recording", "features/signed-links", "features/tv-outputs", "features/monitoring",
  "solutions/", "solutions/churches", "solutions/internet-tv", "solutions/production-companies", "solutions/iptv-operators",
  "guide/introduction", "guide/dashboard", "guide/earning", "guide/compatibility", "guide/test-results", "guide/releases", "guide/windows",
  "guide/streaming", "guide/watching", "guide/protect-playback", "guide/accounts", "guide/transcoding", "guide/recording", "guide/channel-inputs",
  "guide/backup-encoder", "guide/playout", "guide/restreaming", "guide/srt", "guide/webrtc", "guide/udp", "guide/broadcast-encoders",
  "guide/pull-inputs", "guide/mpts", "guide/relays", "guide/analyser", "guide/monitoring", "guide/license", "guide/troubleshooting",
  "blog/", "blog/how-many-viewers-can-one-server-carry", "blog/staying-on-air-when-the-encoder-fails", "blog/why-your-hls-stream-is-30-seconds-behind",
  "brand", "order", "glossary",
  // fr/privacy.md, fr/disclaimer.md and fr/security.md exist but are not
  // published until a French speaker has read them (config.mts srcExclude).
]);
