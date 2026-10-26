import { MailIcon, PhoneIcon } from "lucide-react";
import { resolveI18n } from "@/lib/i18n";
import { telHref } from "@/lib/contact-links";
import type { Contact } from "@/lib/content/bundle";

/** One person from the panel's contacts: name, role, tap-to-call and mailto (each only when set). */
export default function ContactCard({ contact }: { contact: Contact }) {
  const link = "inline-flex items-center gap-2 font-bold text-pm-mint transition-colors hover:text-pm-mint-hover";
  return (
    <li className="flex flex-col gap-1 rounded-[18px] border border-pm-line bg-pm-card p-5">
      <span className="text-[17px] font-extrabold text-pm-text">{contact.name}</span>
      {resolveI18n(contact.position) && <span className="text-sm text-pm-text-2">{resolveI18n(contact.position)}</span>}
      <span className="mt-2 flex flex-col gap-1.5 text-[15px]">
        {contact.phone && (
          <a href={telHref(contact.phone)} className={link}>
            <PhoneIcon size={14} aria-hidden /> {contact.phone}
          </a>
        )}
        {contact.email && (
          <a href={`mailto:${contact.email}`} className={`${link} break-all`}>
            <MailIcon size={14} aria-hidden /> {contact.email}
          </a>
        )}
      </span>
    </li>
  );
}
