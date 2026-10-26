import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getActiveAnnouncement } from "@/lib/server/announcements";
import { announcementDate, announcementParagraphs } from "@/lib/announcements";

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
  if (!announcement) return { title: "Duyuru bulunamadı" };

  return {
    title: announcement.title,
    description: announcement.description.slice(0, 160),
    alternates: { canonical: `/announcements/${id}` },
    openGraph: announcement.image_url ? { images: [announcement.image_url] } : undefined,
  };
}

export default async function AnnouncementPage({ params }: Props) {
  const { id } = await params;
  const announcement = await getActiveAnnouncement(id);
  if (!announcement) notFound();

  const { title, description, image_url, image_alt_text } = announcement;

  return (
    <main className="container flex flex-col gap-6 py-8 lg:py-16 max-w-3xl">
      <Link href="/announcements" className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-[#E30A17]">
        <ArrowLeft size={14} /> Tüm duyurular
      </Link>

      <header className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wide text-neutral-400">
          Duyuru · {announcementDate(announcement)}
        </span>
        <h1 className="text-3xl md:text-5xl leading-tight">{title}</h1>
      </header>

      {/* Full photo in its original aspect ratio (the panel never crops it). */}
      {image_url && (
        <Image
          src={image_url}
          alt={image_alt_text ?? title}
          width={1600}
          height={1600}
          priority
          sizes="(min-width: 768px) 48rem, 100vw"
          className="h-auto w-full rounded-xl border border-neutral-800"
        />
      )}

      <div className="flex flex-col gap-4 text-neutral-200">
        {announcementParagraphs(description).map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
    </main>
  );
}
