import Link from "next/link";
import PhotoFrame from "@/components/media/PhotoFrame";
import { ArrowRightIcon, MegaphoneIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { announcementDate, type PublicAnnouncement } from "@/lib/announcements";

type Props = {
  announcement: PublicAnnouncement;
  /** "tall": the home hero's portrait card; "default": 16:9 list card. */
  variant?: "default" | "tall";
  /** Load the photo eagerly (above the fold). */
  priority?: boolean;
  className?: string;
};

// Two variants, like the app's card: with a photo → the photo on top (PhotoFrame:
// its own aspect ratio, capped at 680 px with a blurred fill); without →
// text-first with an icon, no image box at all.
export default function AnnouncementCard({ announcement, variant = "default", priority = false, className }: Props) {
  const { id, title, description, image_url, image_alt_text } = announcement;
  const tall = variant === "tall";
  const sizes = tall ? "(min-width: 1024px) 30rem, 100vw" : "(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw";

  return (
    <Link
      href={`/announcements/${id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[24px] border border-pm-line bg-pm-card text-left transition-colors hover:border-pm-mint/40",
        className,
      )}
    >
      {image_url && (
        <PhotoFrame src={image_url} alt={image_alt_text ?? title} size={announcement.image_size} fallbackRatio={tall ? "4 / 5" : "16 / 9"} sizes={sizes} priority={priority} />
      )}

      <div className={cn("flex gap-4", tall ? "p-6" : "p-5")}>
        {!image_url && (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-pm-tile text-pm-mint">
            <MegaphoneIcon size={20} aria-hidden />
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-pm-mint">
            {t.announcement.eyebrow} · {announcementDate(announcement)}
          </span>
          <h3 className={cn("font-extrabold leading-snug text-pm-text", tall ? "text-xl" : "text-lg")}>{title}</h3>
          <p className={cn("text-sm text-pm-text-2", tall ? "line-clamp-4" : "line-clamp-3")}>{description}</p>
          {tall && (
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-pm-mint transition-colors group-hover:text-pm-text">
              {t.announcement.readMore} <ArrowRightIcon size={14} aria-hidden />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
