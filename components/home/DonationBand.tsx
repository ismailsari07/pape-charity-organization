import Link from "next/link";
import { HeartIcon } from "lucide-react";
import { t } from "@/lib/i18n";
import type { DonationFund } from "@/lib/server/funds";
import { Eyebrow } from "@/components/site/SectionHeading";
import { reveal } from "@/lib/reveal";

/** Fund buttons → /donation?fund=<slug> (the donation page opens that fund). */
export default function DonationBand({ funds }: { funds: DonationFund[] }) {
  return (
    <section id="bagis" className="scroll-mt-6">
      <div className="flex flex-col gap-8 rounded-[28px] border border-pm-band-line bg-pm-band p-10 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-3 lg:basis-[380px]">
          <Eyebrow {...reveal("right")} className="text-pm-band-eyebrow">{t.donation.eyebrow}</Eyebrow>
          <h2 className="text-[38px] leading-tight font-extrabold tracking-[-0.8px] text-pm-text" {...reveal("right", 60)}>{t.donation.title}</h2>
          <p className="text-[17px] leading-[1.6] text-pm-band-text" {...reveal("up", 120)}>
            {t.donation.intro}
          </p>
        </div>
        {funds.length > 0 ? (
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 lg:basis-[420px]">
            {funds.map((f, i) => (
              <Link
                key={f.slug}
                {...reveal("up", 150 + i * 70)}
                href={`/donation?fund=${encodeURIComponent(f.slug)}`}
                className="flex items-center justify-between gap-3 rounded-[16px] bg-white/[0.08] px-5 py-[18px] text-[17px] font-bold text-white transition-colors hover:bg-white/[0.12]"
              >
                {f.title} <span aria-hidden>→</span>
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
