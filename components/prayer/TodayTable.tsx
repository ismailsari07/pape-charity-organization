"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { DATE_LOCALE, t } from "@/lib/i18n";
import { torontoDate } from "@/lib/prayer/range";
import { currentTimetableRow, dayTitle, hijriTitle, prayerClock12, torontoMinutes, type PrayerDay } from "@/lib/prayer/display";

type Props = {
  /** Today's Toronto date when the page was rendered. */
  serverToday: string;
  /** Today's and tomorrow's rows (either may be missing). */
  days: PrayerDay[];
};

/** Re-renders at every minute boundary with the current time; null until mounted. */
function useMinuteClock(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    setNow(new Date());
    const timeout = setTimeout(() => {
      setNow(new Date());
      interval = setInterval(() => setNow(new Date()), 60_000);
    }, 60_000 - (Date.now() % 60_000));
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []);
  return now;
}

/**
 * Today's timetable. The row and the ŞİMDİ highlight are chosen in the
 * browser on the Toronto clock, so a page cached before midnight still shows
 * the right day; the server render uses its own date and no highlight.
 */
export default function TodayTable({ serverToday, days }: Props) {
  const now = useMinuteClock();
  const date = now ? torontoDate(now) : serverToday;
  const day = days.find((d) => d.date === date);
  const current = now && day ? currentTimetableRow(day.prayers, torontoMinutes(now)) : null;
  const hijri = day ? hijriTitle(day.hijriDate, t.prayer.hijriMonths) : null;

  const currentIndex = day ? day.prayers.findIndex((p) => p.name === current) : -1;
  const cols = "grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]";

  return (
    <section id="vakitler" className="flex scroll-mt-6 flex-col gap-4 rounded-[24px] border border-pm-line bg-pm-card p-[22px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[13px] font-bold tracking-[1.5px] text-pm-mint uppercase">{t.prayer.todayTitle}</h2>
          <p className="text-lg font-extrabold text-pm-text">{dayTitle(date, DATE_LOCALE)}</p>
        </div>
        {hijri && <span className="rounded-full bg-white/[0.07] px-3 py-1.5 text-[13px] font-semibold text-[#c9d8d1]">{hijri}</span>}
      </div>

      {!day ? (
        <p className="py-4 text-[15px] text-pm-text-2">{t.prayer.notLoaded}</p>
      ) : (
        <>
          <div className="flex flex-col overflow-hidden rounded-[16px] bg-white/[0.03]">
            <div className={cn(cols, "px-[18px] py-2.5 text-xs font-bold tracking-[1px] text-pm-table-head uppercase")}>
              <span>{t.prayer.columnPrayer}</span>
              <span className="text-right">{t.prayer.columnAthan}</span>
              <span className="text-right">{t.prayer.columnIqamah}</span>
            </div>
            <ul>
              {day.prayers.map((p, i) => {
                const isNow = i === currentIndex;
                // A hairline above every row, except around the filled current row.
                const line = !isNow && (currentIndex < 0 || i !== currentIndex + 1) ? "border-t border-white/[0.06]" : "";
                return (
                  <li
                    key={p.name}
                    aria-current={isNow ? "time" : undefined}
                    className={cn(
                      cols,
                      "items-center px-[18px] py-[13px] text-base tabular-nums",
                      isNow ? "mx-1.5 my-0.5 rounded-[12px] bg-pm-green text-white" : cn("text-pm-text", line),
                    )}
                  >
                    <span className={cn("flex items-center gap-2", isNow ? "font-extrabold" : "font-semibold")}>
                      {t.prayer.names[p.name] ?? p.name}
                      {isNow && (
                        <span className="rounded-full bg-white/[0.18] px-2 py-0.5 text-[11px] font-extrabold tracking-[0.5px] uppercase">{t.prayer.now}</span>
                      )}
                    </span>
                    <span className={cn("text-right", isNow ? "text-[#e3f4ec]" : "text-pm-text-3")}>{prayerClock12(p.name, p.time)}</span>
                    {p.iqamah ? (
                      <span className={cn("text-right", isNow ? "font-extrabold" : "font-bold")}>{prayerClock12(p.name, p.iqamah)}</span>
                    ) : (
                      <span className={cn("text-right", isNow ? "text-white/70" : "text-pm-dash")}>—</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          {day.jumuah && (
            <div className="flex items-center justify-between gap-3 rounded-[14px] border border-pm-gold-line bg-pm-gold-bg px-[18px] py-3.5 tabular-nums">
              <span className="flex items-center gap-2.5 text-base font-bold text-pm-gold">
                <HomeIcon size={18} aria-hidden />
                {t.prayer.jumuah}
              </span>
              {/* Jumu'ah is one time (athan = jama'ah); the Dhuhr rule decides AM/PM. */}
              <span className="text-base font-extrabold text-pm-gold-soft">{prayerClock12("Dhuhr", day.jumuah)}</span>
            </div>
          )}
        </>
      )}

      <p className="text-[13px] text-pm-table-head">{t.prayer.footnote}</p>
    </section>
  );
}

/** The mockup's simple house mark for the Jumu'ah row. */
function HomeIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 21V11l8-6 8 6v10" />
      <path d="M10 21v-5h4v5" />
    </svg>
  );
}
