import type { Metadata } from "next";
import { getDict } from "../i18n/index.ts";
import { LANGS, localePath, type Lang } from "../i18n/config.ts";

const OG_LOCALES: Record<Lang, string> = { tr: "tr_TR", en: "en_CA", fr: "fr_CA" };

/** hreflang for one path: every language, with Turkish (the root URLs) as the default. */
export function languageAlternates(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(LANGS.map((l) => [l, localePath(l, path)])),
    "x-default": path,
  };
}

type PageSeo = {
  /** Left out on the home page, which uses the site name alone. */
  title?: string;
  description: string;
  /** Page-specific share images (an announcement's or news photo); the site's image otherwise. */
  images?: string[];
};

/** Title, description, canonical, hreflang and share tags of an indexable page in one language. */
export function pageMetadata(lang: Lang, path: string, { title, description, images }: PageSeo): Metadata {
  const { seo } = getDict(lang);
  const shareTitle = title ?? seo.siteName;
  const shareImages = images ?? ["/opengraph-image"];
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: localePath(lang, path), languages: languageAlternates(path) },
    openGraph: {
      type: "website",
      url: localePath(lang, path),
      siteName: seo.siteName,
      title: shareTitle,
      description,
      locale: OG_LOCALES[lang],
      alternateLocale: LANGS.filter((l) => l !== lang).map((l) => OG_LOCALES[l]),
      images: shareImages,
    },
    twitter: { card: "summary_large_image", title: shareTitle, description, images: shareImages },
  };
}
