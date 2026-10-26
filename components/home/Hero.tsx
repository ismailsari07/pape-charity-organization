import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { t } from "@/lib/i18n";
import AnnouncementCard from "@/components/announcements/AnnouncementCard";
import TodayTable from "@/components/prayer/TodayTable";
import { Eyebrow } from "@/components/site/SectionHeading";
import type { PublicAnnouncement } from "@/lib/announcements";
import type { PrayerDay } from "@/lib/prayer/display";

type Props = {
  prayer: { today: string; days: PrayerDay[] };
  /** Newest active announcement; null → the left column takes the full width. */
  announcement: PublicAnnouncement | null;
  announcementCount: number;
};

// Mobile: heading → announcement → table. Desktop: heading and table on the
// left, the announcement on the right, aligned to the top (never stretched).
export default function Hero({ prayer, announcement, announcementCount }: Props) {
  return (
    <section className={announcement ? "grid gap-x-10 gap-y-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]" : "grid gap-y-7"}>
      <div className="flex flex-col gap-4">
        <Eyebrow>{t.hero.eyebrow}</Eyebrow>
        <h1 className="text-[56px] leading-[1.05] font-extrabold tracking-[-1.5px] text-pm-text">{t.hero.title}</h1>
        <p className="max-w-[540px] text-lg leading-[1.55] text-pm-intro">{t.hero.intro}</p>
      </div>

      {announcement && (
        <div className="flex flex-col gap-3 self-start lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <AnnouncementCard announcement={announcement} variant="tall" priority />
          {announcementCount > 1 && (
            <Link href="/community?tab=duyurular" className="inline-flex items-center gap-1 self-end text-[15px] font-bold text-pm-mint transition-colors hover:text-pm-mint-hover">
              {t.announcement.all(announcementCount)} <ArrowRightIcon size={14} aria-hidden />
            </Link>
          )}
        </div>
      )}

      <div className="self-start lg:col-start-1 lg:row-start-2">
        <TodayTable serverToday={prayer.today} days={prayer.days} />
      </div>
    </section>
  );
}
