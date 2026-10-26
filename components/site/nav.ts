import { t } from "@/lib/i18n";
import type { Features } from "@/lib/content/bundle";

export type NavItem = { href: string; label: string };

// Header navigation. Feature flags hide sections the panel switched off.
export function navItems(features: Features): NavItem[] {
  return [
    { href: "/prayer-times", label: t.nav.prayerTimes },
    ...(features.announcements ? [{ href: "/announcements", label: t.nav.announcements }] : []),
    ...(features.events ? [{ href: "/events", label: t.nav.events }] : []),
    ...(features.burialService ? [{ href: "/services", label: t.nav.services }] : []),
    { href: "/#iletisim", label: t.nav.contact },
  ];
}
