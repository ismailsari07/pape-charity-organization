import Hero from "@/components/home/Hero";
import EventsSection from "@/components/home/EventsSection";
import ServicesSection from "@/components/home/ServicesSection";
import DonationBand from "@/components/home/DonationBand";
import AppSection from "@/components/home/AppSection";
import ContactSection from "@/components/home/ContactSection";
import { getActiveAnnouncements } from "@/lib/server/announcements";
import { getPrayerDays } from "@/lib/server/prayer";
import { getUpcomingEvents } from "@/lib/server/events";
import { getDonationFunds } from "@/lib/server/funds";
import { getSiteContent } from "@/lib/server/content";
import { torontoDate } from "@/lib/prayer/range";

// ISR: prayer rows, announcements, events, funds and flags refresh at most once a minute.
export const revalidate = 60;

/** A failed read hides only its own section; the home page always renders. */
function orEmpty<T>(label: string, fallback: T) {
  return (error: unknown): T => {
    console.error(`[home] ${label} fetch failed`, error);
    return fallback;
  };
}

export default async function Home() {
  const content = await getSiteContent();
  const { features } = content;

  const [prayer, announcements, events, funds] = await Promise.all([
    getPrayerDays().catch(orEmpty("prayer_cache", null)),
    features.announcements ? getActiveAnnouncements().catch(orEmpty("announcements", [])) : [],
    features.events ? getUpcomingEvents().catch(orEmpty("youth_events", [])) : [],
    getDonationFunds().catch(orEmpty("donation_funds", [])),
  ]);

  // Only the burial service for now; marriage stays hidden on the website whatever its flag.
  const burial = features.burialService ? content.services.find((s) => s.kind === "burial") : undefined;

  return (
    <main className="mx-auto flex max-w-[1248px] flex-col gap-24 px-6 pt-14">
      <Hero prayer={prayer ?? { today: torontoDate(), days: [] }} announcement={announcements[0] ?? null} announcementCount={announcements.length} />
      <EventsSection events={events} />
      {burial && <ServicesSection burial={burial} cemeteryName={content.cemetery.name} />}
      <DonationBand funds={funds} />
      <AppSection appStoreUrl={content.links.app_store} />
      <ContactSection mosque={content.mosque} />
    </main>
  );
}
