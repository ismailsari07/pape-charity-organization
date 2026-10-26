import Link from "next/link";
import { ArrowRightIcon, PhoneIcon } from "lucide-react";
import { resolveI18n, t } from "@/lib/i18n";
import type { Contact, Service } from "@/lib/content/bundle";
import SectionHeading from "@/components/site/SectionHeading";
import { SERVICE_ICON } from "@/components/services/serviceIcon";

/** Burial service card only (marriage is hidden on the website for now). */
export default function ServicesSection({ burial, contacts }: { burial: Service; contacts: Contact[] }) {
  const Icon = SERVICE_ICON[burial.icon] ?? SERVICE_ICON.leaf;
  return (
    <section id="hizmetler" className="flex scroll-mt-6 flex-col gap-8">
      <SectionHeading eyebrow={t.services.eyebrow} title={t.services.title} intro={t.services.intro} />
      <Link
        href="/services"
        className="group flex flex-col gap-5 rounded-[24px] border border-pm-line bg-pm-card p-6 transition-colors hover:border-pm-mint/40 md:flex-row md:items-start md:gap-8 md:p-8"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-pm-tile text-pm-mint">
          <Icon size={22} />
        </span>
        <div className="flex flex-1 flex-col gap-3">
          <h3 className="text-xl font-extrabold text-pm-text">{resolveI18n(burial.title)}</h3>
          <p className="text-sm font-semibold text-pm-mint">{resolveI18n(burial.summary)}</p>
          {resolveI18n(burial.body) && <p className="max-w-3xl text-pm-text-2">{resolveI18n(burial.body)}</p>}
          {contacts.length > 0 && (
            <ul className="mt-1 flex flex-wrap gap-x-8 gap-y-2 text-sm text-pm-text-3">
              {contacts.map((c) => (
                <li key={c.id} className="flex items-center gap-2">
                  <PhoneIcon size={14} className="text-pm-muted" aria-hidden />
                  <span className="font-bold text-pm-text">{c.name}</span> {c.phone}
                </li>
              ))}
            </ul>
          )}
          <span className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-pm-mint transition-colors group-hover:text-pm-text">
            {t.services.details} <ArrowRightIcon size={14} aria-hidden />
          </span>
        </div>
      </Link>
    </section>
  );
}
