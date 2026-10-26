import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRightIcon, MapPinIcon } from "lucide-react";
import { resolveI18n, t } from "@/lib/i18n";
import { directionsUrl } from "@/lib/content/bundle";
import { getSiteContent } from "@/lib/server/content";
import SectionHeading from "@/components/site/SectionHeading";
import { SERVICE_ICON } from "@/components/services/serviceIcon";
import ContactCard from "@/components/contacts/ContactCard";

export const revalidate = 60;

export const metadata: Metadata = {
  title: t.services.pageTitle,
  description: t.services.intro,
  alternates: { canonical: "/services" },
};

// Only the burial service for now (marriage hidden on the website).
export default async function ServicesPage() {
  const content = await getSiteContent();
  const burial = content.features.burialService ? content.services.find((s) => s.kind === "burial") : undefined;
  if (!burial) notFound();

  const Icon = SERVICE_ICON[burial.icon] ?? SERVICE_ICON.leaf;
  const contacts = content.contacts.filter((c) => c.group === "burial");
  const { cemetery } = content;
  const history = resolveI18n(cemetery.history);
  const card = "flex flex-col gap-4 rounded-[24px] border border-pm-line bg-pm-card p-6 md:p-8";

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-7 px-6 pt-14">
      <SectionHeading as="h1" eyebrow={t.services.eyebrow} title={t.services.title} intro={t.services.intro} />

      <section className={card}>
        <div className="flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-[14px] bg-pm-tile text-pm-mint">
            <Icon size={22} />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-pm-text">{resolveI18n(burial.title)}</h2>
            <p className="text-sm font-semibold text-pm-mint">{resolveI18n(burial.summary)}</p>
          </div>
        </div>
        {resolveI18n(burial.body) && <p className="text-pm-text-2">{resolveI18n(burial.body)}</p>}
      </section>

      {contacts.length > 0 && (
        <section className={card}>
          <h2 className="text-lg font-extrabold text-pm-text">{t.services.contactsTitle}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {contacts.map((c) => (
              <ContactCard key={c.id} contact={c} />
            ))}
          </ul>
        </section>
      )}

      {cemetery.name && (
        <section className={card}>
          <h2 className="text-lg font-extrabold text-pm-text">{t.services.cemeteryTitle}</h2>
          <p className="flex items-start gap-2 text-pm-text-3">
            <MapPinIcon size={16} className="mt-1 shrink-0 text-pm-muted" aria-hidden />
            <span>
              <span className="font-bold text-pm-text">{cemetery.name}</span>
              <br />
              {cemetery.street}, {cemetery.city}
            </span>
          </p>
          {history && <p className="text-pm-text-2">{history}</p>}
          <a href={directionsUrl(cemetery)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 self-start text-sm font-bold text-pm-mint transition-colors hover:text-pm-mint-hover">
            {t.services.directions} <ArrowRightIcon size={14} aria-hidden />
          </a>
        </section>
      )}
    </main>
  );
}
