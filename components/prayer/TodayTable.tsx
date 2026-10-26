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

  return (
    <section id="vakitler" className="scroll-mt-6 rounded-[24px] border border-pm-line bg-pm-card p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-pm-text">{t.prayer.todayTitle}</h2>
          <p className="text-sm text-pm-text-2">{dayTitle(date, DATE_LOCALE)}</p>
        </div>
        {hijri && <span className="rounded-full bg-pm-tile px-3 py-1 text-xs font-bold text-pm-mint">{hijri}</span>}
      </div>

      {!day ? (
        <p className="px-1 py-6 text-sm text-pm-text-2">{t.prayer.notLoaded}</p>
      ) : (
        <>
          <div className="grid grid-cols-[1fr_5.5rem_5.5rem] px-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-pm-muted sm:grid-cols-[1fr_7rem_7rem]">
            <span>{t.prayer.columnPrayer}</span>
            <span className="text-right">{t.prayer.columnAthan}</span>
            <span className="text-right">{t.prayer.columnIqamah}</span>
          </div>
          <ul className="flex flex-col gap-1">
            {day.prayers.map((p) => {
              const isNow = p.name === current;
              return (
                <li
                  key={p.name}
                  aria-current={isNow ? "time" : undefined}
                  className={cn(
                    "grid grid-cols-[1fr_5.5rem_5.5rem] items-center rounded-[14px] px-4 py-3 tabular-nums sm:grid-cols-[1fr_7rem_7rem]",
                    isNow ? "bg-pm-green text-white" : "text-pm-text",
                  )}
                >
                  <span className="flex items-center gap-2 font-bold">
                    {t.prayer.names[p.name] ?? p.name}
                    {isNow && (
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                        {t.prayer.now}
                      </span>
                    )}
                  </span>
                  <span className={cn("text-right", isNow ? "text-white/85" : "text-pm-text-2")}>{prayerClock12(p.name, p.time)}</span>
                  <span className="text-right font-bold">{p.iqamah ? prayerClock12(p.name, p.iqamah) : "—"}</span>
                </li>
              );
            })}
            {day.jumuah && (
              <li className="mt-1 grid grid-cols-[1fr_auto] items-center rounded-[14px] border border-pm-gold-line bg-pm-gold-bg px-4 py-3 tabular-nums">
                <span className="font-bold text-pm-gold">{t.prayer.jumuah}</span>
                {/* Jumu'ah is one time (athan = jama'ah); the Dhuhr rule decides AM/PM. */}
                <span className="text-right font-bold text-pm-gold-soft">{prayerClock12("Dhuhr", day.jumuah)}</span>
              </li>
            )}
          </ul>
        </>
      )}

      <p className="px-1 pt-4 text-xs text-pm-muted">{t.prayer.footnote}</p>
    </section>
  );
}
