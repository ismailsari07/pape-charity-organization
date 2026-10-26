import { ArrowRightIcon, ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { resolveI18n, t } from "@/lib/i18n";
import { directionsUrl, type MosqueInfo } from "@/lib/content/bundle";
import SectionHeading from "@/components/site/SectionHeading";

const tel = (phone: string) => `tel:+1${phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "")}`;

export default function ContactSection({ mosque }: { mosque: MosqueInfo }) {
  const card = "flex flex-col gap-3 rounded-[22px] border border-pm-line bg-pm-card p-5";
  const tile = "flex size-10 items-center justify-center rounded-[12px] bg-pm-tile text-pm-mint";
  const label = "text-xs font-bold uppercase tracking-[0.12em] text-pm-muted";
  const link = "font-bold text-pm-text transition-colors hover:text-pm-mint";

  return (
    <section id="iletisim" className="flex scroll-mt-6 flex-col gap-8">
      <SectionHeading eyebrow={t.contact.eyebrow} title={t.contact.title} />
      <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={card}>
          <span className={tile}>
            <MapPinIcon size={18} />
          </span>
          <p className={label}>{t.contact.address}</p>
          <p className="font-bold text-pm-text">
            {mosque.street}
            <br />
            {mosque.city} {mosque.postalCode}
          </p>
          <a href={directionsUrl(mosque)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-pm-mint transition-colors hover:text-pm-text">
            {t.contact.directions} <ArrowRightIcon size={14} aria-hidden />
          </a>
        </div>
        <div className={card}>
          <span className={tile}>
            <PhoneIcon size={18} />
          </span>
          <p className={label}>{t.contact.phone}</p>
          <a href={tel(mosque.phone)} className={link}>
            {mosque.phone}
          </a>
        </div>
        <div className={card}>
          <span className={tile}>
            <MailIcon size={18} />
          </span>
          <p className={label}>{t.contact.email}</p>
          <a href={`mailto:${mosque.email}`} className={`${link} break-all`}>
            {mosque.email}
          </a>
        </div>
        <div className={card}>
          <span className={tile}>
            <ClockIcon size={18} />
          </span>
          <p className={label}>{t.contact.hours}</p>
          <dl className="flex flex-col gap-2 text-sm">
            {mosque.hours.map((h, i) => (
              <div key={i}>
                <dt className="font-bold text-pm-text">{resolveI18n(h.label)}</dt>
                <dd className="text-pm-text-2">{resolveI18n(h.value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
