import { t } from "@/lib/i18n";
import { Eyebrow } from "@/components/site/SectionHeading";
import { reveal } from "@/lib/reveal";

/** The App Store button appears only once the panel has links.app_store. */
export default function AppSection({ appStoreUrl }: { appStoreUrl?: string }) {
  return (
    <section id="uygulama" className="flex scroll-mt-6 flex-col gap-8 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 flex-col gap-3.5 lg:basis-[420px]">
        <Eyebrow {...reveal("right")}>{t.app.eyebrow}</Eyebrow>
        <h2 className="text-[38px] leading-tight font-extrabold tracking-[-0.8px] text-pm-text" {...reveal("right", 60)}>{t.app.title}</h2>
        <p className="text-[17px] leading-[1.6] text-pm-text-2" {...reveal("up", 120)}>
          {t.app.intro}
        </p>
        {appStoreUrl && (
          <a
            href={appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex items-center gap-2.5 self-start rounded-[14px] bg-pm-text px-[22px] py-3.5 text-base font-bold text-[#0a1310] transition-colors hover:bg-white"
          >
            {t.app.appStore}
          </a>
        )}
      </div>
      <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 lg:basis-[420px]">
        {t.app.features.map((f, i) => (
          <div key={f.title} className="flex flex-col gap-1.5 rounded-[18px] border border-pm-line bg-pm-card p-5" {...reveal("up", 150 + i * 70)}>
            <h3 className="text-base font-extrabold text-pm-text">{f.title}</h3>
            <p className="text-sm text-pm-text-2">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
