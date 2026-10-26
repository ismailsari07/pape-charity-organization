import { BellIcon, HeartIcon, LayoutGridIcon, MegaphoneIcon } from "lucide-react";
import { t } from "@/lib/i18n";
import AppleIcon from "@/components/icons/AppleIcon";

const ICONS = [BellIcon, MegaphoneIcon, LayoutGridIcon, HeartIcon];

/** The App Store button appears only once the panel has links.app_store. */
export default function AppSection({ appStoreUrl }: { appStoreUrl?: string }) {
  return (
    <section id="uygulama" className="grid scroll-mt-6 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center">
      <div className="flex flex-col gap-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-pm-mint">{t.app.eyebrow}</p>
        <h2 className="text-3xl font-extrabold tracking-tight text-pm-text md:text-4xl">{t.app.title}</h2>
        <p className="text-pm-text-2">{t.app.intro}</p>
        {appStoreUrl && (
          <a
            href={appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 self-start rounded-[14px] bg-pm-text px-5 py-3 font-bold text-[#0a1310] transition-colors hover:bg-white"
          >
            <AppleIcon size={18} /> {t.app.appStore}
          </a>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {t.app.features.map((f, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div key={f.title} className="flex flex-col gap-3 rounded-[22px] border border-pm-line bg-pm-card p-5">
              <span className="flex size-10 items-center justify-center rounded-[12px] bg-pm-tile text-pm-mint">
                <Icon size={18} />
              </span>
              <h3 className="font-extrabold text-pm-text">{f.title}</h3>
              <p className="text-sm text-pm-text-2">{f.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
