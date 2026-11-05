import type { MetadataRoute } from "next";
import { LANGS, localePath } from "@/lib/i18n/config";
import { getActiveAnnouncements } from "@/lib/server/announcements";
import { getSiteContent } from "@/lib/server/content";
import { getPublishedNews } from "@/lib/server/news";

const SITE = "https://papemosque.ca";

// Rebuilt at most once a minute, like the pages.
export const revalidate = 60;

/** Every indexable page in every language. A failed read leaves out only its own items. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { features } = await getSiteContent();
  const [announcements, news] = await Promise.all([
    features.announcements ? getActiveAnnouncements().catch(() => []) : [],
    features.news ? getPublishedNews().catch(() => []) : [],
  ]);

  const paths = [
    "/",
    "/prayer-times",
    ...(features.events || features.announcements ? ["/community"] : []),
    ...(features.burialService ? ["/services"] : []),
    "/iletisim",
    "/donation",
    "/privacy",
    ...announcements.map((a) => `/announcements/${a.id}`),
    ...news.map((n) => `/haberler/${n.id}`),
  ];

  const url = (lang: (typeof LANGS)[number], path: string) => {
    const local = localePath(lang, path);
    return local === "/" ? `${SITE}/` : `${SITE}${local}`;
  };
  return paths.flatMap((path) =>
    LANGS.map((lang) => ({
      url: url(lang, path),
      alternates: { languages: Object.fromEntries(LANGS.map((l) => [l, url(l, path)])) },
    })),
  );
}
