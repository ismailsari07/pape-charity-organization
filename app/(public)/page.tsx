import News from "@/components/News";
import Services from "@/components/Services";
import UpcomingEvents from "@/components/UpcomingEvents";
import Hero from "@/components/home/Hero";
import { getActiveAnnouncements } from "@/lib/server/announcements";
import { getPrayerDays } from "@/lib/server/prayer";
import { torontoDate } from "@/lib/prayer/range";
import { getSiteContent } from "@/lib/server/content";
import type { PublicAnnouncement } from "@/lib/announcements";

// ISR: prayer rows, announcements and flags refresh at most once a minute.
export const revalidate = 60;

export default async function Home() {
  const content = await getSiteContent();

  // Neither problem may break the home page: without data the hero shows
  // "not loaded yet" in the table, and no announcement card.
  const [prayer, announcements] = await Promise.all([
    getPrayerDays().catch((error) => {
      console.error("[home] prayer_cache fetch failed", error);
      return null;
    }),
    content.features.announcements
      ? getActiveAnnouncements().catch((error): PublicAnnouncement[] => {
          console.error("[home] announcements fetch failed", error);
          return [];
        })
      : Promise.resolve([] as PublicAnnouncement[]),
  ]);

  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-16 md:px-6 md:pt-14">
        <Hero
          prayer={prayer ?? { today: torontoDate(), days: [] }}
          announcement={announcements[0] ?? null}
          announcementCount={announcements.length}
        />
      </div>
      {/* Phase 1 of the redesign: these sections are replaced in phase 2. */}
      <div className="container">
        <Services />
        <UpcomingEvents />
        <News />
      </div>
    </main>
  );
}
