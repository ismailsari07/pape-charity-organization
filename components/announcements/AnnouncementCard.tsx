import Link from "next/link";
import Image from "next/image";
import { MegaphoneIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { announcementDate, type PublicAnnouncement } from "@/lib/announcements";

type Props = {
  announcement: PublicAnnouncement;
  /** Load the photo eagerly (the hero card is above the fold). */
  priority?: boolean;
  className?: string;
};

// Two variants, like the app's card: with a photo → 16:9 crop on top;
// without → text-first with an icon, no image box at all.
export default function AnnouncementCard({ announcement, priority = false, className }: Props) {
  const { id, title, description, image_url, image_alt_text } = announcement;

  return (
    <Link
      href={`/announcements/${id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-800/50 text-left shadow-sm transition-colors hover:border-[#E30A17]/60",
        className,
      )}
    >
      {image_url && (
        // Whole photo inside the 16:9 frame (posters are often square); the
        // sides are filled by a blurred, darkened copy of the same image.
        // Same src and sizes → the browser downloads it only once.
        <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
          <Image
            src={image_url}
            alt=""
            aria-hidden
            fill
            priority={priority}
            sizes="(min-width: 768px) 28rem, 100vw"
            className="scale-110 object-cover blur-2xl brightness-[0.6]"
          />
          <Image
            src={image_url}
            alt={image_alt_text ?? title}
            fill
            priority={priority}
            sizes="(min-width: 768px) 28rem, 100vw"
            className="object-contain"
          />
        </div>
      )}

      <div className="flex gap-4 p-5">
        {!image_url && (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#E30A17]/15 text-[#E30A17]">
            <MegaphoneIcon size={20} />
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-xs uppercase tracking-wide text-neutral-400">
            Duyuru · {announcementDate(announcement)}
          </span>
          <h3 className="text-lg font-semibold leading-snug group-hover:text-[#E30A17]">{title}</h3>
          <p className="line-clamp-3 text-sm text-neutral-300">{description}</p>
        </div>
      </div>
    </Link>
  );
}
