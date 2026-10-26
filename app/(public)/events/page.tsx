import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { t } from "@/lib/i18n";
import { getSiteContent } from "@/lib/server/content";
import { getUpcomingEvents } from "@/lib/server/events";
import EventCard from "@/components/events/EventCard";
import SectionHeading from "@/components/site/SectionHeading";

export const revalidate = 60;

export const metadata: Metadata = {
  title: t.events.pageTitle,
  description: t.events.pageIntro,
  alternates: { canonical: "/events" },
};

export default async function EventsPage() {
  const { features } = await getSiteContent();
  if (!features.events) notFound();
  const events = await getUpcomingEvents();

  return (
    <main className="mx-auto flex max-w-[1248px] flex-col gap-7 px-6 pt-14">
      <SectionHeading as="h1" eyebrow={t.events.eyebrow} title={t.events.title} intro={t.events.pageIntro} />
      {events.length === 0 ? (
        <p className="text-pm-text-2">{t.events.empty}</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((u) => (
            <EventCard key={u.event.id} upcoming={u} showDescription />
          ))}
        </div>
      )}
    </main>
  );
}
