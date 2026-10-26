import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { getSiteContent } from "@/lib/server/content";
import { getUpcomingEvents } from "@/lib/server/events";
import { getActiveAnnouncements } from "@/lib/server/announcements";
import SectionHeading from "@/components/site/SectionHeading";
import EventCard from "@/components/events/EventCard";
import AnnouncementCard from "@/components/announcements/AnnouncementCard";

export const metadata: Metadata = {
  title: t.community.eyebrow,
  description: t.community.intro,
  alternates: { canonical: "/community" },
};

type Tab = "etkinlikler" | "duyurular";
type Props = { searchParams: Promise<{ tab?: string | string[] }> };

/**
 * Events and announcements behind two tabs, like the app's Community screen.
 * The tab lives in the URL (?tab=duyurular), so links can open either one and
 * the server sends the right tab (no flash). Reading searchParams renders the
 * page per request; its data reads are cached 60 s (lib/server/*), so the
 * database is still asked at most once a minute.
 */
export default async function CommunityPage({ searchParams }: Props) {
  const { features } = await getSiteContent();
  const tabs: Tab[] = [...(features.events ? (["etkinlikler"] as const) : []), ...(features.announcements ? (["duyurular"] as const) : [])];
  if (tabs.length === 0) notFound();

  const requested = (await searchParams).tab;
  const tab: Tab = tabs.includes(requested as Tab) ? (requested as Tab) : tabs[0];

  return (
    <main className="mx-auto flex max-w-[1248px] flex-col gap-7 px-6 pt-14">
      <SectionHeading as="h1" eyebrow={t.community.eyebrow} title={t.community.title} intro={t.community.intro} />

      {tabs.length > 1 && (
        <nav aria-label={t.community.tabsLabel} className="flex w-full gap-1 self-start rounded-full border border-pm-line bg-pm-card p-1 sm:w-auto">
          {tabs.map((key) => (
            <Link
              key={key}
              href={key === tabs[0] ? "/community" : `/community?tab=${key}`}
              replace
              scroll={false}
              aria-current={key === tab ? "page" : undefined}
              className={cn(
                "flex-1 rounded-full px-6 py-2.5 text-center text-[15px] font-bold transition-colors sm:flex-none",
                key === tab ? "bg-pm-green text-white" : "text-pm-text-3 hover:text-pm-mint-hover",
              )}
            >
              {t.community.tabs[key]}
            </Link>
          ))}
        </nav>
      )}

      {tab === "etkinlikler" ? <EventsPanel /> : <AnnouncementsPanel />}
    </main>
  );
}

async function EventsPanel() {
  const events = await getUpcomingEvents();
  if (events.length === 0) return <p className="text-pm-text-2">{t.events.empty}</p>;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((u) => (
        <EventCard key={u.event.id} upcoming={u} showDescription />
      ))}
    </div>
  );
}

async function AnnouncementsPanel() {
  const announcements = await getActiveAnnouncements();
  if (announcements.length === 0) return <p className="text-pm-text-2">{t.announcementsPage.empty}</p>;
  return (
    <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {announcements.map((a, i) => (
        <AnnouncementCard key={a.id} announcement={a} priority={i < 3} />
      ))}
    </div>
  );
}
