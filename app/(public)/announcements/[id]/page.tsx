import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteContent } from "@/lib/server/content";
import PhotoFrame from "@/components/media/PhotoFrame";
import Link from "next/link";
import { getActiveAnnouncement } from "@/lib/server/announcements";
import { announcementDate, announcementParagraphs } from "@/lib/announcements";
import { imageSize } from "@/lib/server/image-size";
import { t } from "@/lib/i18n";
import { reveal } from "@/lib/reveal";

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
  // Natural size (cached per URL): the photo takes its own height without a layout shift.
  const size = image_url ? await imageSize(image_url) : null;

  const text = (
    <article className="flex min-w-0 flex-col gap-5">
      <span className="text-sm font-bold tracking-[1.5px] text-pm-mint uppercase" {...reveal("right")}>
        {t.announcement.eyebrow} · {announcementDate(announcement)}
      </span>
      <h1 className="text-[36px] leading-[1.1] font-extrabold tracking-[-1px] text-pm-text md:text-[44px]" {...reveal("right", 60)}>
        {title}
      </h1>
      <div className="flex flex-col gap-4 text-[17px] leading-[1.7] text-pm-text-2" {...reveal("up", 120)}>
        {announcementParagraphs(description).map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
      <Link href="/community?tab=duyurular" className="mt-2 self-start text-[15px] font-bold text-pm-mint transition-colors hover:text-pm-mint-hover">
        {t.announcementsPage.back} →
      </Link>
    </article>
  );

  // Desktop: photo (about the hero card's size, PhotoFrame rules) beside the
  // text; mobile: stacked, photo first. Without a photo: text only, full width.
  return (
    <main className="mx-auto max-w-[1248px] px-6 pt-14">
      {image_url ? (
        <div className="grid items-start gap-8 lg:grid-cols-[480px_minmax(0,1fr)] lg:gap-14">
          <div {...reveal("up", 80)}>
          <PhotoFrame
            src={image_url}
            alt={image_alt_text ?? title}
            size={size}
            fallbackRatio="4 / 5"
            sizes="(min-width: 1024px) 480px, 100vw"
            priority
            className="rounded-[24px] border border-pm-line"
          />
          </div>
          {text}
        </div>
      ) : (
        <div className="max-w-[860px]">{text}</div>
      )}
    </main>
  );
}
