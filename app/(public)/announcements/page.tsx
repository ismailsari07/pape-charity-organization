import type { Metadata } from "next";
import AnnouncementCard from "@/components/announcements/AnnouncementCard";
import { getActiveAnnouncements } from "@/lib/server/announcements";

// ISR: same freshness as the home hero.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Duyurular",
  description: "Pape Camii'nin güncel duyuruları.",
  alternates: { canonical: "/announcements" },
};

export default async function AnnouncementsPage() {
  const announcements = await getActiveAnnouncements();

  return (
    <main className="container flex flex-col gap-8 py-8 lg:py-16">
      <h1 className="text-4xl md:text-6xl text-center">Duyurular</h1>

      {announcements.length === 0 ? (
        <p className="text-center text-neutral-400">Şu anda aktif duyuru yok.</p>
      ) : (
        <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {announcements.map((a, i) => (
            <AnnouncementCard key={a.id} announcement={a} priority={i < 3} />
          ))}
        </div>
      )}
    </main>
  );
}
