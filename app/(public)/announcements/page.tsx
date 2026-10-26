import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteContent } from "@/lib/server/content";
import AnnouncementCard from "@/components/announcements/AnnouncementCard";
import SectionHeading from "@/components/site/SectionHeading";
import { t } from "@/lib/i18n";
import { getActiveAnnouncements } from "@/lib/server/announcements";

// ISR: same freshness as the home hero.
export const revalidate = 60;

export const metadata: Metadata = {
  title: t.announcementsPage.eyebrow,
  description: t.announcementsPage.intro,
  alternates: { canonical: "/announcements" },
};

export default async function AnnouncementsPage() {
  if (!(await getSiteContent()).features.announcements) notFound();
  const announcements = await getActiveAnnouncements();

  return (
    <main className="mx-auto flex max-w-[1248px] flex-col gap-7 px-6 pt-14">
      <SectionHeading as="h1" eyebrow={t.announcementsPage.eyebrow} title={t.announcementsPage.title} intro={t.announcementsPage.intro} />

      {announcements.length === 0 ? (
        <p className="text-pm-text-2">{t.announcementsPage.empty}</p>
      ) : (
        <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {announcements.map((a, i) => (
            <AnnouncementCard key={a.id} announcement={a} priority={i < 3} />
          ))}
        </div>
      )}
    </main>
  );
}
