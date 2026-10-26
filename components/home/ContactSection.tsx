import Image from "next/image";
import { resolveI18n, t } from "@/lib/i18n";
import { directionsUrl, type MosqueInfo } from "@/lib/content/bundle";
import { Eyebrow } from "@/components/site/SectionHeading";

const tel = (phone: string) => `tel:+1${phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "")}`;

// Decorative "map" tiles (two rows of six); no embedded map for now.
const TILES = ["a", "a", "b", "a", "b", "a", "b", "a", "a", "b", "a", "b"];

export default function ContactSection({ mosque }: { mosque: MosqueInfo }) {
  const label = "text-[13px] font-bold text-pm-muted uppercase";
  const link = "text-pm-mint transition-colors hover:text-pm-mint-hover";

  return (
    <section id="iletisim" className="flex scroll-mt-6 flex-col gap-5 md:flex-row">
      <div className="flex min-w-0 flex-col gap-[18px] rounded-[22px] border border-pm-line bg-pm-card p-7 md:flex-[1_1_380px]">
        <Eyebrow>{t.contact.eyebrow}</Eyebrow>
        <h2 className="text-[32px] leading-tight font-extrabold tracking-[-0.6px] text-pm-text">{t.contact.title}</h2>
        <dl className="flex flex-col gap-3.5 text-base text-pm-text">
          <div className="flex flex-col gap-0.5">
            <dt className={label}>{t.contact.address}</dt>
            <dd>
              {mosque.street}, {mosque.city} {mosque.postalCode}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className={label}>{t.contact.phone}</dt>
            <dd>
              <a href={tel(mosque.phone)} className={link}>
                {mosque.phone}
              </a>
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className={label}>{t.contact.email}</dt>
            <dd>
              <a href={`mailto:${mosque.email}`} className={`${link} break-all`}>
                {mosque.email}
              </a>
            </dd>
          </div>
          {mosque.hours.length > 0 && (
            <div className="flex flex-col gap-0.5">
              <dt className={label}>{t.contact.hours}</dt>
              {mosque.hours.map((h, i) => (
                <dd key={i}>
                  {/* The first row is the general opening; further rows name what they are about. */}
                  {i === 0 ? resolveI18n(h.value) : `${resolveI18n(h.label)}: ${resolveI18n(h.value)}`}
                </dd>
              ))}
            </div>
          )}
        </dl>
      </div>

      <div className="relative flex min-h-[320px] min-w-0 items-end overflow-hidden rounded-[22px] border border-pm-line bg-pm-map p-[22px] md:flex-[1.4_1_420px]">
        <div className="absolute inset-0 grid grid-cols-6 gap-2.5 p-5 opacity-35" aria-hidden>
          {TILES.map((tone, i) => (
            <span key={i} className={`rounded-[6px] ${tone === "a" ? "bg-[#233a32]" : "bg-[#1d312a]"}`} />
          ))}
        </div>
        <span className="absolute top-[42%] left-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-pm-green shadow-[0_10px_30px_rgba(0,0,0,0.4)]" aria-hidden>
          <Image src="/brand/logo-green.png" alt="" width={36} height={36} className="size-9 rounded-[10px]" />
        </span>
        <a
          href={directionsUrl(mosque)}
          target="_blank"
          rel="noopener noreferrer"
          className="relative inline-flex items-center gap-2 rounded-full bg-pm-green px-5 py-[13px] text-[15px] font-bold text-white transition-colors hover:bg-pm-green-hover"
        >
          {t.contact.directions}
        </a>
      </div>
    </section>
  );
}
