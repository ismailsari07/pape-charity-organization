import type { Lang } from "./config.ts";
import { en } from "./en.ts";
import { fr } from "./fr.ts";
import { tr, type Dictionary } from "./tr.ts";

export type { Dictionary };

const DICTIONARIES: Record<Lang, Dictionary> = { tr, en, fr };

/** Server components only: importing this in a client component ships all three dictionaries. */
export function getDict(lang: Lang): Dictionary {
  return DICTIONARIES[lang];
}

/** The strings client components need, in one language. Plain data: it crosses to the browser as props. */
export function clientMessages(lang: Lang) {
  const { nav, site, prayer, prayerPage, donation, error, common, notFound, news } = DICTIONARIES[lang];
  return {
    nav,
    site,
    prayer,
    prayerPage,
    donation,
    error,
    common,
    notFound,
    news: {
      photosLabel: news.photosLabel,
      openFullscreen: news.openFullscreen,
      previous: news.previous,
      next: news.next,
      goTo: news.goTo,
      close: news.close,
    },
  };
}

export type ClientMessages = ReturnType<typeof clientMessages>;

/** A {tr,en,fr} database text: the chosen language, then English, then Turkish (the app's fallback). */
export function resolveI18n(value: unknown, lang: Lang): string {
  if (!value || typeof value !== "object") return "";
  const v = value as Record<string, unknown>;
  const pick = (k: string) => (typeof v[k] === "string" && (v[k] as string).trim() ? (v[k] as string) : null);
  return pick(lang) ?? pick("en") ?? pick("tr") ?? "";
}
