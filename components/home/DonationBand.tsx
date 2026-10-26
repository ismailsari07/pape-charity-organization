import Link from "next/link";
import { ArrowRightIcon, HeartIcon } from "lucide-react";
import { t } from "@/lib/i18n";
import type { DonationFund } from "@/lib/server/funds";

/** Fund buttons → /donation?fund=<slug> (the donation page opens that fund). */
export default function DonationBand({ funds }: { funds: DonationFund[] }) {
  return (
    <section id="bagis" className="scroll-mt-6 rounded-[24px] border border-pm-band-line bg-pm-band p-6 md:p-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-pm-mint">{t.donation.eyebrow}</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-pm-text md:text-4xl">{t.donation.title}</h2>
          <p className="text-pm-text-3">{t.donation.intro}</p>
        </div>
        {funds.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {funds.map((f) => (
              <Link
                key={f.slug}
                href={`/donation?fund=${encodeURIComponent(f.slug)}`}
                className="flex items-center justify-between gap-3 rounded-[14px] border border-pm-band-line bg-black/15 px-5 py-4 font-bold text-pm-text transition-colors hover:border-pm-mint/50 hover:text-pm-mint"
              >
                {f.title} <ArrowRightIcon size={16} aria-hidden />
              </Link>
            ))}
          </div>
        ) : (
          <Link href="/donation" className="inline-flex items-center gap-2 self-start rounded-full bg-pm-green px-6 py-3 font-bold text-white transition-colors hover:bg-pm-green-hover">
            <HeartIcon size={16} aria-hidden /> {t.donation.allFunds}
          </Link>
        )}
      </div>
    </section>
  );
}
