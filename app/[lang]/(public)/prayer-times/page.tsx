import { getDict } from "@/lib/i18n";
import { type Lang } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import { getPrayerRange } from "@/lib/server/prayer";
import { torontoDate } from "@/lib/prayer/range";
import SectionHeading from "@/components/site/SectionHeading";
import TodayTable from "@/components/prayer/TodayTable";
import MonthTable from "@/components/prayer/MonthTable";
import { reveal } from "@/lib/reveal";

// ISR: prayer_cache changes (refresh cron, panel overrides) show up within about a minute.
export const revalidate = 60;

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  const lang = (await params).lang as Lang;
  const t = getDict(lang);
  return pageMetadata(lang, "/prayer-times", { title: t.prayerPage.title, description: t.prayerPage.intro });
}

export default async function PrayerTimesPage({ params }: Props) {
  const t = getDict((await params).lang as Lang);
  const range = await getPrayerRange().catch((error) => {
    console.error("[prayer-times] prayer_cache fetch failed", error);
    return { today: torontoDate(), days: [] };
  });

  return (
    <main className="mx-auto flex max-w-[1248px] flex-col gap-10 px-6 pt-14">
      <SectionHeading as="h1" eyebrow={t.prayerPage.eyebrow} title={t.prayerPage.title} intro={t.prayerPage.intro} />
      <div className="max-w-[640px]" {...reveal("up", 150)}>
        {/* Today + tomorrow are enough for the day table; it picks today's row in the browser. */}
        <TodayTable serverToday={range.today} days={range.days.slice(0, 2)} />
      </div>
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-[28px] font-extrabold tracking-[-0.5px] text-pm-text" {...reveal("right")}>
            {t.prayerPage.monthTitle}
          </h2>
          <p className="max-w-3xl text-[15px] text-pm-text-2" {...reveal("up", 60)}>
            {t.prayerPage.monthIntro}
          </p>
        </div>
        <div {...reveal("up", 100)}>
          <MonthTable serverToday={range.today} days={range.days} />
        </div>
      </section>
    </main>
  );
}
