// Languages and URLs, without any dictionary, so client components and the
// middleware can import it. Turkish lives at the root (no prefix); English and
// French under /en and /fr. Paths and query values are the same in every language.

export const LANGS = ["tr", "en", "fr"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "tr";

export const LANG_COOKIE = "pm_lang";

export const DATE_LOCALES: Record<Lang, string> = { tr: "tr-TR", en: "en-CA", fr: "fr-CA" };

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

/** An internal link in a language: localePath("fr", "/donation?fund=zekat") → "/fr/donation?fund=zekat". */
export function localePath(lang: Lang, href: string): string {
  if (lang === DEFAULT_LANG) return href;
  return href === "/" ? `/${lang}` : `/${lang}${href}`;
}

/** The path without its language: "/en/donation" → "/donation", "/en" → "/". */
export function stripLang(pathname: string): string {
  const first = pathname.split("/")[1];
  if (!isLang(first)) return pathname;
  return pathname.slice(first.length + 1) || "/";
}

export type RouteDecision =
  | { kind: "next" }
  | { kind: "rewrite"; to: string }
  | { kind: "redirect"; to: string; status: 307 | 308 };

/**
 * What the middleware does with a page request. Only "/" follows the language
 * cookie, and only when it is a real page load: the logo on a Turkish page is a
 * client-side navigation to "/" and stays Turkish. Every other URL opens in the
 * language it says, so shared links open as sent.
 */
export function routeRequest(pathname: string, cookie: string | undefined, isPageLoad: boolean): RouteDecision {
  const first = pathname.split("/")[1];
  if (first === DEFAULT_LANG) return { kind: "redirect", to: stripLang(pathname), status: 308 };
  if (isLang(first)) return { kind: "next" };
  if (pathname === "/" && isPageLoad && isLang(cookie) && cookie !== DEFAULT_LANG) {
    return { kind: "redirect", to: `/${cookie}`, status: 307 };
  }
  return { kind: "rewrite", to: pathname === "/" ? `/${DEFAULT_LANG}` : `/${DEFAULT_LANG}${pathname}` };
}
