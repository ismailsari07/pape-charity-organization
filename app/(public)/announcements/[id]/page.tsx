import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteContent } from "@/lib/server/content";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getActiveAnnouncement } from "@/lib/server/announcements";
import { announcementDate, announcementParagraphs } from "@/lib/announcements";
import { imageSize } from "@/lib/server/image-size";
import { t } from "@/lib/i18n";

// ISR: rendered on first visit, then refreshed at most once a minute, so an
// archived or expired announcement turns into a 404 within about a minute.
export const revalidate = 60;

// No ids at build time: every page is rendered on its first visit and cached.
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const announcement = await getActiveAnnouncement(id);
  if (!announcement) return { title: t.notFound.title };

  return {
    title: announcement.title,
    description: announcement.description.slice(0, 160),
    alternates: { canonical: `/announcements/${id}` },
    openGraph: announcement.image_url ? { images: [announcement.image_url] } : undefined,
  };
}

export default async function AnnouncementPage({ params }: Props) {
  const { id } = await params;
  if (!(await getSiteContent()).features.announcements) notFound();
  const announcement = await getActiveAnnouncement(id);
  if (!announcement) notFound();

  const { title, description, image_url, image_alt_text } = announcement;
  // Natural size (cached per URL) so the full photo takes its own height without a layout shift.
  const size = image_url ? await imageSize(image_url) : null;

  return (
    <main className="mx-auto flex max-w-[860px] flex-col gap-6 px-6 pt-14">
      <Link href="/announcements" className="inline-flex items-center gap-1 self-start text-[15px] font-bold text-pm-mint transition-colors hover:text-pm-mint-hover">
        <ArrowLeft size={16} aria-hidden /> {t.announcementsPage.back}
      </Link>

      <header className="flex flex-col gap-3">
        <span className="text-sm font-bold tracking-[1.5px] text-pm-mint uppercase">
          {t.announcement.eyebrow} · {announcementDate(announcement)}
        </span>
        <h1 className="text-[36px] leading-[1.1] font-extrabold tracking-[-1px] text-pm-text md:text-[48px]">{title}</h1>
      </header>

      {/* Full photo in its original aspect ratio (the panel never crops it). */}
      {image_url && (
        <Image
          src={image_url}
          alt={image_alt_text ?? title}
          width={size?.width ?? 1600}
          height={size?.height ?? 1600}
          priority
          sizes="(min-width: 860px) 812px, 100vw"
          className="h-auto w-full rounded-[22px] border border-pm-line"
        />
      )}

      <div className="flex flex-col gap-4 text-[17px] leading-[1.7] text-pm-text-2">
        {announcementParagraphs(description).map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
    </main>
  );
}
