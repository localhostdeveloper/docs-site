// Stands in for VitePress's own language links (theme-default/composables/
// langs.js, swapped in by an alias in config.mts). VitePress links every page
// to the same address in the other language, which is a "page not found"
// while only some pages are translated. Here the switch goes to the same page
// only when it is listed in translated.ts, and to the other language's home
// page otherwise.
import { computed } from "vue";
import { useData } from "vitepress";
import { TRANSLATED } from "../translated";

const homeOf = (key: string, link?: string) => link || (key === "root" ? "/" : `/${key}/`);

export function useLangs({ correspondingLink = false } = {}) {
  const { site, localeIndex, page, hash } = useData();

  const currentLang = computed(() => ({
    label: site.value.locales[localeIndex.value]?.label,
    link: homeOf(localeIndex.value, site.value.locales[localeIndex.value]?.link),
  }));

  const localeLinks = computed(() => {
    // The page without its language: "fr/guide/install.md" -> "guide/install", "fr/index.md" -> "".
    const path = page.value.relativePath
      .slice(currentLang.value.link.length - 1)
      .replace(/(^|\/)index\.md$/, "$1")
      .replace(/\.md$/, "")
      .replace(/\/$/, "");
    const same = correspondingLink && TRANSLATED.has(path);
    return Object.entries(site.value.locales).flatMap(([key, value]) => {
      if (value.label === currentLang.value.label) return [];
      const home = homeOf(key, value.link);
      return { text: value.label, link: same ? home.replace(/\/$/, "") + "/" + path + hash.value : home };
    });
  });

  return { localeLinks, currentLang };
}
