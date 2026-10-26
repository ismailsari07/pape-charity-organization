import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { t } from "@/lib/i18n";
import AnnouncementCard from "@/components/announcements/AnnouncementCard";
import TodayTable from "@/components/prayer/TodayTable";
import type { PublicAnnouncement } from "@/lib/announcements";
import type { PrayerDay } from "@/lib/prayer/display";

type Props = {
  prayer: { today: string; days: PrayerDay[] };
  /** Newest active announcement; null → the left column takes the full width. */
  announcement: PublicAnnouncement | null;
  announcementCount: number;
};

export default function Hero({ prayer, announcement, announcementCount }: Props) {
  return (
    <section className={announcement ? "grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10" : "grid gap-8"}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-pm-mint">{t.hero.eyebrow}</p>
          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-pm-text md:text-6xl">{t.hero.title}</h1>
          <p className="max-w-xl text-base text-pm-text-2 md:text-lg">{t.hero.intro}</p>
        </div>
        <TodayTable serverToday={prayer.today} days={prayer.days} />
      </div>

      {announcement && (
        <div className="flex flex-col gap-3">
          <AnnouncementCard announcement={announcement} variant="tall" priority />
          {announcementCount > 1 && (
            <Link href="/announcements" className="inline-flex items-center gap-1 self-end text-sm font-bold text-pm-mint transition-colors hover:text-pm-text">
              {t.announcement.all(announcementCount)} <ArrowRightIcon size={14} aria-hidden />
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
