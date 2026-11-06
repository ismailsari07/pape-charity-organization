import { getDict } from "../i18n/index.ts";
import { localePath, type Lang } from "../i18n/config.ts";

const SITE = "https://papemosque.ca";

export function breadcrumbJsonLd(lang: Lang) {
  const { seo } = getDict(lang);
  const home = lang === "tr" ? `${SITE}/` : `${SITE}/${lang}`;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: seo.breadcrumbHome, item: home },
      { "@type": "ListItem", position: 2, name: seo.breadcrumbDonation, item: `${SITE}${localePath(lang, "/donation")}` },
    ],
  };
}
