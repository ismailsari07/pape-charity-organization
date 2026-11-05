import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { getDict } from "@/lib/i18n";
import { localePath, type Lang } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import { getSiteContent } from "@/lib/server/content";
import { getUpcomingEvents } from "@/lib/server/events";
import { getActiveAnnouncements } from "@/lib/server/announcements";
import SectionHeading from "@/components/site/SectionHeading";
import EventCard from "@/components/events/EventCard";
import AnnouncementCard from "@/components/announcements/AnnouncementCard";
import NewsCard from "@/components/news/NewsCard";
import { getPublishedNews } from "@/lib/server/news";
import type { PublicNews } from "@/lib/news";
import { reveal } from "@/lib/reveal";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang;
  const t = getDict(lang);
  return pageMetadata(lang, "/community", { title: t.community.eyebrow, description: t.community.intro });
}

type Tab = "etkinlikler" | "duyurular" | "haberler";
type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ tab?: string | string[]; sayfa?: string | string[] }> };

const NEWS_PAGE_SIZE = 12;

/**
 * Events, announcements and news behind tabs, like the app's Community screen.
 * The news tab shows only once something is published.
 * The tab lives in the URL (?tab=duyurular), so links can open either one and
 * the server sends the right tab (no flash). Reading searchParams renders the
 * page per request; its data reads are cached 60 s (lib/server/*), so the
 * database is still asked at most once a minute.
 */
export default async function CommunityPage({ params, searchParams }: Props) {
  const lang = (await params).lang as Lang;
  const t = getDict(lang);
  const { features } = await getSiteContent();
  // A failed read hides only this tab.
  const news = features.news
    ? await getPublishedNews().catch((error: unknown) => {
        console.error("[community] mosque_news fetch failed", error);
        return [] as PublicNews[];
      })
    : [];
  const tabs: Tab[] = [
    ...(features.events ? (["etkinlikler"] as const) : []),
    ...(features.announcements ? (["duyurular"] as const) : []),
    ...(news.length > 0 ? (["haberler"] as const) : []),
  ];
  if (tabs.length === 0) notFound();

  const { tab: requested, sayfa } = await searchParams;
  const tab: Tab = tabs.includes(requested as Tab) ? (requested as Tab) : tabs[0];

  return (
    <main className="mx-auto flex max-w-[1248px] flex-col gap-7 px-6 pt-14">
      <SectionHeading as="h1" eyebrow={t.community.eyebrow} title={t.community.title} intro={t.community.intro} />

      {tabs.length > 1 && (
        <nav aria-label={t.community.tabsLabel} className="flex w-full gap-1 self-start rounded-full border border-pm-line bg-pm-card p-1 sm:w-auto" {...reveal("up", 160)}>
          {tabs.map((key) => (
            <Link
              key={key}
              href={localePath(lang, key === tabs[0] ? "/community" : `/community?tab=${key}`)}
              replace
              scroll={false}
              aria-current={key === tab ? "page" : undefined}
              className={cn(
                "min-w-0 flex-1 rounded-full px-2 py-2.5 text-center text-[15px] font-bold transition-colors sm:flex-none sm:px-6",
                key === tab ? "bg-pm-green text-white" : "text-pm-text-3 hover:text-pm-mint-hover",
              )}
            >
              {t.community.tabs[key]}
            </Link>
          ))}
        </nav>
      )}

      {tab === "etkinlikler" ? <EventsPanel lang={lang} /> : tab === "duyurular" ? <AnnouncementsPanel lang={lang} /> : <NewsPanel lang={lang} news={news} page={Number(sayfa) || 1} first={tabs[0] === "haberler"} />}
    </main>
  );
}

async function EventsPanel({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const events = await getUpcomingEvents();
  if (events.length === 0) return <p className="text-pm-text-2">{t.events.empty}</p>;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((u, i) => (
        <EventCard lang={lang} key={u.event.id} upcoming={u} showDescription showContribution revealDelay={(i % 3) * 70} />
      ))}
    </div>
  );
}

async function AnnouncementsPanel({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const announcements = await getActiveAnnouncements();
  if (announcements.length === 0) return <p className="text-pm-text-2">{t.announcementsPage.empty}</p>;
  return (
    <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {announcements.map((a, i) => (
        <AnnouncementCard lang={lang} key={a.id} announcement={a} priority={i < 3} revealDelay={(i % 3) * 70} />
      ))}
    </div>
  );
}

function NewsPanel({ lang, news, page, first }: { lang: Lang; news: PublicNews[]; page: number; first: boolean }) {
  const t = getDict(lang);
  const shown = news.slice(0, Math.max(1, page) * NEWS_PAGE_SIZE);
  return (
    <>
      <div className="grid grid-cols-2 items-start gap-3 sm:gap-5 lg:grid-cols-4">
        {shown.map((n, i) => (
          <NewsCard lang={lang} key={n.id} news={n} priority={i < 4} revealDelay={(i % 4) * 70} />
        ))}
      </div>
      {shown.length < news.length && (
        <Link
          href={localePath(lang, `/community?${first ? "" : "tab=haberler&"}sayfa=${Math.max(1, page) + 1}`)}
          replace
          scroll={false}
          className="self-center rounded-full border border-pm-line px-6 py-3 text-[15px] font-bold text-pm-text transition-colors hover:border-pm-mint/40"
        >
          {t.news.more}
        </Link>
      )}
    </>
  );
}
