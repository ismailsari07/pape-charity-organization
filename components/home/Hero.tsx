import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { t } from "@/lib/i18n";
import AnnouncementCard from "@/components/announcements/AnnouncementCard";
import TodayTable from "@/components/prayer/TodayTable";
import { Eyebrow } from "@/components/site/SectionHeading";
import { reveal } from "@/lib/reveal";
import AnnouncementStrip from "@/components/news/AnnouncementStrip";
import NewsCard from "@/components/news/NewsCard";
import type { PublicAnnouncement } from "@/lib/announcements";
import type { PublicNews } from "@/lib/news";
import type { PrayerDay } from "@/lib/prayer/display";

type Props = {
  prayer: { today: string; days: PrayerDay[] };
  /** Newest active announcement; null → the left column takes the full width. */
  announcement: PublicAnnouncement | null;
  announcementCount: number;
  /** Newest featured news item; null → the hero stays as it was without news. */
  news?: PublicNews | null;
};

export default function Hero({ news, ...props }: Props) {
  return news ? <NewsHero news={news} {...props} /> : <AnnouncementHero {...props} />;
}

// Phone: heading → news card → announcement strip → table → intro, so the card
// shows without scrolling. Desktop: heading, intro and table on the left, the
// card and the strip on the right.
function NewsHero({ prayer, announcement, news }: Props & { news: PublicNews }) {
  return (
    <section className="grid gap-x-10 gap-y-3.5 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-y-7">
      <div className="flex flex-col gap-2 lg:gap-4">
        <Eyebrow {...reveal("right")}>{t.hero.eyebrow}</Eyebrow>
        <h1 className="text-[36px] leading-[1.08] font-extrabold tracking-[-1px] text-pm-text lg:text-[56px] lg:leading-[1.05] lg:tracking-[-1.5px]" {...reveal("right", 60)}>
          {t.hero.title}
        </h1>
        <p className="hidden max-w-[540px] text-lg leading-[1.55] text-pm-intro lg:block" {...reveal("up", 120)}>
          {t.hero.intro}
        </p>
      </div>

      <div className="flex flex-col gap-3 self-start lg:col-start-2 lg:row-span-2 lg:row-start-1" {...reveal("up", 160)}>
        <NewsCard news={news} variant="hero" priority />
        {announcement && <AnnouncementStrip announcement={announcement} />}
      </div>

      <div className="mt-3.5 flex flex-col gap-5 self-start lg:col-start-1 lg:row-start-2 lg:mt-0" {...reveal("up", 200)}>
        <TodayTable serverToday={prayer.today} days={prayer.days} />
        <p className="text-base leading-[1.55] text-pm-intro lg:hidden">{t.hero.intro}</p>
      </div>
    </section>
  );
}

// Mobile: heading → announcement → table. Desktop: heading and table on the
// left, the announcement on the right, aligned to the top (never stretched).
function AnnouncementHero({ prayer, announcement, announcementCount }: Props) {
  return (
    <section className={announcement ? "grid gap-x-10 gap-y-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]" : "grid gap-y-7"}>
      <div className="flex flex-col gap-4">
        <Eyebrow {...reveal("right")}>{t.hero.eyebrow}</Eyebrow>
        <h1 className="text-[56px] leading-[1.05] font-extrabold tracking-[-1.5px] text-pm-text" {...reveal("right", 60)}>
          {t.hero.title}
        </h1>
        <p className="max-w-[540px] text-lg leading-[1.55] text-pm-intro" {...reveal("up", 120)}>
          {t.hero.intro}
        </p>
      </div>

      {announcement && (
        <div className="flex flex-col gap-3 self-start lg:col-start-2 lg:row-span-2 lg:row-start-1" {...reveal("up", 160)}>
          <AnnouncementCard announcement={announcement} variant="tall" priority />
          {announcementCount > 1 && (
            <Link href="/community?tab=duyurular" className="inline-flex items-center gap-1 self-end text-[15px] font-bold text-pm-mint transition-colors hover:text-pm-mint-hover">
              {t.announcement.all(announcementCount)} <ArrowRightIcon size={14} aria-hidden />
            </Link>
          )}
        </div>
      )}

      <div className="self-start lg:col-start-1 lg:row-start-2" {...reveal("up", 200)}>
        <TodayTable serverToday={prayer.today} days={prayer.days} />
      </div>
    </section>
  );
}
