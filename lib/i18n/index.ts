import { tr, type Dictionary } from "./tr";

// The site is Turkish only for now. Adding English/French = a new dictionary
// file plus picking the locale here (and in the routes); components only ever
// read `t` and `SITE_LOCALE`.
export const SITE_LOCALE = "tr" as const;
export const DATE_LOCALE = "tr-TR";

export const t: Dictionary = tr;

/** A {tr,en,fr} database text: the chosen language, then English, then Turkish (the app's fallback). */
export function resolveI18n(value: unknown, lang: string = SITE_LOCALE): string {
  if (!value || typeof value !== "object") return "";
  const v = value as Record<string, unknown>;
  const pick = (k: string) => (typeof v[k] === "string" && (v[k] as string).trim() ? (v[k] as string) : null);
  return pick(lang) ?? pick("en") ?? pick("tr") ?? "";
}
