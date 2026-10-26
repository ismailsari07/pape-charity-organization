import Image from "next/image";
import type { ComponentType } from "react";
import { BookOpenIcon, CalendarDaysIcon, ClockIcon, MapPinIcon, SmartphoneIcon, UserIcon, UsersIcon } from "lucide-react";
import { DATE_LOCALE, t } from "@/lib/i18n";
import { dayTitle } from "@/lib/prayer/display";
import { sessionLine, type UpcomingEvent } from "@/lib/events/schedule";
import MosqueIcon from "@/components/icons/MosqueIcon";

// The app's category → icon mapping (AppIcons.forEventCategory).
const CATEGORY_ICON: Record<string, ComponentType<{ size?: number }>> = {
  education: BookOpenIcon,
  youth: UserIcon,
  family: UsersIcon,
  worship: MosqueIcon,
};

const words = { everyWeekday: t.events.everyWeekday, everyTwoWeeks: t.events.everyTwoWeeks, monthly: t.events.monthly, afterPrayer: t.events.afterPrayer };

/** Like the app's event card: the photo band, or an icon tile when there's no photo. */
export default function EventCard({ upcoming, showDescription = false }: { upcoming: UpcomingEvent; showDescription?: boolean }) {
  const e = upcoming.event;
  const category = e.category?.trim().toLowerCase() ?? "";
  const Icon = CATEGORY_ICON[category] ?? CalendarDaysIcon;
  const label = t.events.categories[category] ?? t.events.categories.community;
  const when = sessionLine(upcoming, words, (iso) => dayTitle(iso, DATE_LOCALE));
  const hasForm = e.registration_form !== null && e.registration_form !== undefined;

  return (
    <article className="flex flex-col overflow-hidden rounded-[24px] border border-pm-line bg-pm-card">
      {e.image_url && (
        <div className="relative aspect-video w-full bg-pm-tile">
          <Image src={e.image_url} alt={e.title} fill sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-3">
          {!e.image_url && (
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-pm-tile text-pm-mint">
              <Icon size={20} />
            </span>
          )}
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-pm-mint">{label}</span>
        </div>
        <h3 className="text-lg font-extrabold leading-snug text-pm-text">{e.title}</h3>
        {showDescription && e.description && <p className="line-clamp-3 text-sm text-pm-text-2">{e.description}</p>}
        <ul className="flex flex-col gap-1.5 text-sm text-pm-text-3">
          <li className="flex items-start gap-2">
            <ClockIcon size={16} className="mt-0.5 shrink-0 text-pm-muted" aria-hidden /> {when}
          </li>
          {e.location && (
            <li className="flex items-start gap-2">
              <MapPinIcon size={16} className="mt-0.5 shrink-0 text-pm-muted" aria-hidden /> {e.location}
            </li>
          )}
        </ul>
        {(hasForm || e.registration_link) && (
          <div className="mt-auto pt-2">
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
                className="inline-flex items-center rounded-[14px] bg-pm-green px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-pm-green-hover"
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
