import Hero from "@/components/Hero";
import News from "@/components/News";
import PrayerTimes from "@/components/PrayerTimes";
import Services from "@/components/Services";
import UpcomingEvents from "@/components/UpcomingEvents";
import { getActiveAnnouncements } from "@/lib/server/announcements";
import type { PublicAnnouncement } from "@/lib/announcements";

// ISR: new, archived or expired announcements show up within about a minute.
export const revalidate = 60;

export default async function Home() {
  // An announcement problem must never break the home page: without data
  // the hero renders exactly as it did before announcements.
  let announcements: PublicAnnouncement[] = [];
  try {
    announcements = await getActiveAnnouncements();
  } catch (error) {
    console.error("[home] announcements fetch failed", error);
  }

  return (
    <main className="container">
      <Hero announcement={announcements[0] ?? null} announcementCount={announcements.length} />
      <PrayerTimes />
      <Services />
      <UpcomingEvents />
      <News />
    </main>
  );
}
