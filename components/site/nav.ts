import { t } from "@/lib/i18n";
import type { Features } from "@/lib/content/bundle";

export type NavItem = { href: string; label: string };

// Header navigation. Feature flags hide sections the panel switched off.
// Phase 1 of the redesign: Etkinlikler/Hizmetler/İletişim still point at the
// existing pages and sections until their new versions ship.
export function navItems(features: Features): NavItem[] {
  return [
    { href: "/#vakitler", label: t.nav.prayerTimes },
    ...(features.announcements ? [{ href: "/announcements", label: t.nav.announcements }] : []),
    ...(features.events ? [{ href: "/service", label: t.nav.events }] : []),
    { href: "/#services", label: t.nav.services },
    { href: "/contact", label: t.nav.contact },
  ];
}
