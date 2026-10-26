import Link from "next/link";
import { resolveI18n, t } from "@/lib/i18n";
import type { Service } from "@/lib/content/bundle";
import { Eyebrow } from "@/components/site/SectionHeading";
import { SERVICE_ICON } from "@/components/services/serviceIcon";

/** Burial service card only (marriage is hidden on the website for now). */
export default function ServicesSection({ burial, cemeteryName }: { burial: Service; cemeteryName: string }) {
  const Icon = SERVICE_ICON[burial.icon] ?? SERVICE_ICON.leaf;
  const summary = [resolveI18n(burial.summary), cemeteryName].filter(Boolean).join(" · ");
  return (
    <section id="hizmetler" className="flex scroll-mt-6 flex-col gap-5 md:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-3 py-2 md:basis-[340px]">
        <Eyebrow>{t.services.eyebrow}</Eyebrow>
        <h2 className="text-[38px] leading-tight font-extrabold tracking-[-0.8px] text-pm-text">{t.services.title}</h2>
        <p className="text-[17px] leading-[1.6] text-pm-text-2">{t.services.intro}</p>
      </div>
      <Link
        href="/services"
        className="group flex min-w-0 flex-1 flex-col gap-3 rounded-[22px] border border-pm-line bg-pm-card p-[26px] transition-colors hover:border-pm-mint/40 md:basis-[300px]"
      >
        <span className="flex size-12 items-center justify-center rounded-[14px] bg-pm-tile text-pm-mint">
          <Icon size={24} />
        </span>
        <h3 className="text-xl font-extrabold text-pm-text">{resolveI18n(burial.title)}</h3>
        {summary && <p className="text-[15px] leading-[1.55] text-pm-text-2">{summary}</p>}
        <span className="mt-auto text-[15px] font-bold text-pm-mint transition-colors group-hover:text-pm-mint-hover">{t.services.details} →</span>
      </Link>
    </section>
  );
}
