import { t } from "@/lib/i18n";
import type { UpcomingEvent } from "@/lib/events/schedule";
import EventCard from "@/components/events/EventCard";
import SectionHeading from "@/components/site/SectionHeading";

/** The next three sessions; nothing when there are none. */
export default function EventsSection({ events }: { events: UpcomingEvent[] }) {
  if (events.length === 0) return null;
  return (
    <section id="etkinlikler" className="flex scroll-mt-6 flex-col gap-7">
      <SectionHeading eyebrow={t.events.eyebrow} title={t.events.title} link={{ href: "/community", label: t.events.all }} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.slice(0, 3).map((u, i) => (
          <EventCard key={u.event.id} upcoming={u} revealDelay={i * 70} />
        ))}
      </div>
    </section>
  );
}
