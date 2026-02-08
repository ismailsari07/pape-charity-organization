"use client";

import { useQuery } from "@tanstack/react-query";
import { getFeaturedEvents } from "@/lib/api/events";
import { Calendar1Icon, PhoneCallIcon } from "lucide-react";
import { Event, EventRow } from "@/app/(protected)/admin/events/types";

export default function UpcomingEvents() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["featured-events"],
    queryFn: getFeaturedEvents,
  });

  if (isLoading) {
    return (
      <section className="flex flex-col gap-3 items-center text-center py-16 lg:py-32">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
        </div>
      </section>
    );
  }

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <section id="upcoming-events" className="flex flex-col gap-3 items-center text-center py-16 lg:py-32">
      <h3 className="text-4xl md:text-6xl font-semibold">Yaklaşan Etkinlik</h3>
      <p className="md:w-1/2 text-lg">
        Discover our upcoming events and weekly programs designed to inspire, connect, and engage our community of all
        ages.
      </p>
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center md:mt-8">
        {events.map((event: Event) => (
          <div
            key={event.id}
            className="flex flex-col items-start text-left gap-2 p-5 border border-gray-100 rounded-2xl"
          >
            <h4 className="text-3xl font-semibold">{event.title}</h4>
            <p>{event.description}</p>
            <div className="flex gap-1 justify-center items-center md:mt-4">
              <Calendar1Icon size={"16"} />
              {event.is_recurring ? `${event.day} — ${event.time}` : `${event.date} — ${event.time}`}
            </div>
            <div className="w-full flex gap-1 items-center">
              {/* add a tag to phone number */}
              <PhoneCallIcon size={"16"} /> {event.phone || "N/A"}
              {event.is_recurring && (
                <div className="px-2 rounded-2xl bg-blue-600 text-blue-100 text-sm ml-auto">haftalık</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
