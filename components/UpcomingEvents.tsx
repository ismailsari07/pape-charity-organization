import { Calendar1Icon, PhoneCallIcon } from "lucide-react";

const events = [
  {
    title: "Gençlik Sohbeti",
    description: "Her çarşamba yatsıdan sonra gençlerle sohbet, ardından yemek ikramı. Haftalık programdır.",
    time: "Çarşamba — Yatsı Namazı",
    phone: "(416) 778-0014",
    priority: "haftalık",
  },
  {
    title: "Aile Toplantısı",
    description: "Her perşembe yatsıdan sonra ailelerin buluşması, sohbet ve çay ikramı ile haftalık buluşma.",
    time: "Perşembe — Yatsı Namazı",
    phone: "(416) 778-0014",
    priority: "haftalık",
  },
];

export default function UpcomingEvents() {
  return (
    <section id="upcoming-events" className="flex flex-col gap-3 items-center text-center py-16 lg:py-32">
      <h3 className="text-4xl md:text-6xl font-semibold">Yaklaşan Etkinlik</h3>
      <p className="md:w-1/2 text-lg">
        Discover our upcoming events and weekly programs designed to inspire, connect, and engage our community of all
        ages.
      </p>
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center md:mt-8">
        {events.map((event, i) => (
          <div key={i} className="flex flex-col items-start text-left gap-2 p-5 border border-gray-100 rounded-2xl">
            <h4 className="text-3xl font-semibold">{event.title}</h4>
            <p>{event.description}</p>
            <div className="flex gap-1 justify-center items-center md:mt-4">
              <Calendar1Icon size={"16"} /> {event.time}
            </div>
            <div className="w-full flex gap-1 items-center">
              <PhoneCallIcon size={"16"} /> {event.phone}
              {event.priority && (
                <div className="px-2 rounded-2xl bg-blue-600 text-blue-100 text-sm ml-auto">{event.priority}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
