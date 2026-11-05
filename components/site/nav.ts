import { getDict } from "@/lib/i18n";
import { localePath, type Lang } from "@/lib/i18n/config";
import type { Features } from "@/lib/content/bundle";

export type NavItem = { href: string; label: string };

// Header navigation. Feature flags hide sections the panel switched off.
export function navItems(features: Features, lang: Lang): NavItem[] {
  const t = getDict(lang);
  return [
    { href: localePath(lang, "/prayer-times"), label: t.nav.prayerTimes },
    ...(features.events || features.announcements ? [{ href: localePath(lang, "/community"), label: t.nav.community }] : []),
    ...(features.burialService ? [{ href: localePath(lang, "/services"), label: t.nav.services }] : []),
    { href: localePath(lang, "/iletisim"), label: t.nav.contact },
  ];
}
