import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { getDict } from "@/lib/i18n";
import { DATE_LOCALES, localePath, type Lang } from "@/lib/i18n/config";
import { announcementDate, type PublicAnnouncement } from "@/lib/announcements";

// The home page's one-line announcement under the news card: always visible, so
// a time-sensitive announcement is never hidden behind a swipe.
export default function AnnouncementStrip({ announcement, lang }: { announcement: PublicAnnouncement; lang: Lang }) {
  const t = getDict(lang);
  return (
    <Link
      href={localePath(lang, `/announcements/${announcement.id}`)}
      className="flex min-h-[68px] items-center gap-3 rounded-2xl border border-[rgba(217,180,90,0.3)] bg-[rgba(217,180,90,0.13)] px-4 py-3 transition-colors hover:border-[rgba(217,180,90,0.6)] lg:min-h-[76px] lg:gap-3.5 lg:rounded-[18px] lg:px-[18px] lg:py-3.5"
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[11px] font-bold tracking-[1.1px] text-[#ecd28f] uppercase">
          {t.announcement.eyebrow} · {announcementDate(announcement, DATE_LOCALES[lang])}
        </span>
        <span className="text-sm leading-[1.3] font-bold text-pm-text lg:text-[15px]">{announcement.title}</span>
      </span>
      <ArrowRightIcon size={18} aria-hidden className="shrink-0 text-[#ecd28f]" />
    </Link>
  );
}
