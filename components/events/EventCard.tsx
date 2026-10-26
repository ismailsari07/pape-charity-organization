import Image from "next/image";
import type { ComponentType } from "react";
import { BookOpenIcon, CalendarDaysIcon, SmartphoneIcon, UserIcon, UsersIcon } from "lucide-react";
import { DATE_LOCALE, t } from "@/lib/i18n";
import { dayTitle } from "@/lib/prayer/display";
import { recurrenceOf, sessionLine, type UpcomingEvent } from "@/lib/events/schedule";
import MosqueIcon from "@/components/icons/MosqueIcon";
import { reveal } from "@/lib/reveal";

// The app's category → icon mapping (AppIcons.forEventCategory).
const CATEGORY_ICON: Record<string, ComponentType<{ size?: number; strokeWidth?: number }>> = {
  education: BookOpenIcon,
  youth: UserIcon,
  family: UsersIcon,
  worship: MosqueIcon,
};

const words = { everyWeekday: t.events.everyWeekday, everyTwoWeeks: t.events.everyTwoWeeks, monthly: t.events.monthly, afterPrayer: t.events.afterPrayer };

/**
 * Like the app's event card: a 170 px band with the photo, or the category
 * icon on a tile colour when there's no photo. Eyebrow: the programme kind
 * for recurring events (as in the app), the category for one-off events.
 */
export default function EventCard({
  upcoming,
  showDescription = false,
  revealDelay,
}: {
  upcoming: UpcomingEvent;
  showDescription?: boolean;
  /** Entrance animation delay in ms (lib/reveal.ts); omitted = no animation. */
  revealDelay?: number;
}) {
  const e = upcoming.event;
  const category = e.category?.trim().toLowerCase() ?? "";
  const Icon = CATEGORY_ICON[category] ?? CalendarDaysIcon;
  const rec = recurrenceOf(e);
  const eyebrow = rec === "none" ? (t.events.categories[category] ?? t.events.categories.community) : t.events.programme[rec];
  const when = sessionLine(upcoming, words, (iso) => dayTitle(iso, DATE_LOCALE));
  const hasForm = e.registration_form !== null && e.registration_form !== undefined;

  return (
    <article className="flex flex-col overflow-hidden rounded-[22px] border border-pm-line bg-pm-card" {...(revealDelay !== undefined ? reveal("up", revealDelay) : {})}>
      {e.image_url ? (
        <div className="relative h-[170px] w-full bg-pm-tile">
          <Image src={e.image_url} alt={e.title} fill sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        </div>
      ) : (
        <div className="flex h-[170px] items-center justify-center bg-pm-tile text-pm-mint">
          <Icon size={44} strokeWidth={1.6} />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 px-[22px] pt-5 pb-6">
        <span className="text-[13px] font-bold tracking-[1px] text-pm-mint uppercase">{eyebrow}</span>
        <h3 className="text-xl font-extrabold text-pm-text">{e.title}</h3>
        {showDescription && e.description && <p className="line-clamp-3 text-[15px] text-pm-text-2">{e.description}</p>}
        <p className="text-[15px] text-pm-text-2">{when}</p>
        {e.location && <p className="text-sm text-pm-muted">{e.location}</p>}
        {(hasForm || e.registration_link) && (
          <div className="mt-auto pt-3">
            {hasForm ? (
              // The in-app form wins over any link (the panel allows one or the other).
              <p className="flex items-center gap-2 text-sm font-semibold text-pm-text-2">
                <SmartphoneIcon size={16} className="text-pm-mint" aria-hidden /> {t.events.registerInApp}
              </p>
            ) : (
              <a
                href={e.registration_link!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-[14px] bg-pm-green px-4 py-2.5 text-[15px] font-bold text-white transition-colors hover:bg-pm-green-hover"
              >
                {e.is_free ? t.events.registerFree : t.events.register}
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
