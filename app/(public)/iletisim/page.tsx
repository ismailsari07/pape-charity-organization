import type { Metadata } from "next";
import { t } from "@/lib/i18n";
import { getSiteContent } from "@/lib/server/content";
import type { Contact } from "@/lib/content/bundle";
import ContactSection from "@/components/home/ContactSection";
import ContactCard from "@/components/contacts/ContactCard";
import { Eyebrow } from "@/components/site/SectionHeading";

export const revalidate = 60;

export const metadata: Metadata = {
  title: t.contact.pageTitle,
  description: t.contact.title,
  alternates: { canonical: "/iletisim" },
};

// Board first, then burial, then any group the panel adds later.
const GROUP_ORDER = ["board", "burial"];

/** Contacts grouped by the panel's group_key, keeping the panel's order inside each group. */
function groupContacts(contacts: Contact[]): [string, Contact[]][] {
  const groups = new Map<string, Contact[]>();
  for (const c of contacts) groups.set(c.group, [...(groups.get(c.group) ?? []), c]);
  const rank = (g: string) => (GROUP_ORDER.includes(g) ? GROUP_ORDER.indexOf(g) : GROUP_ORDER.length);
  return [...groups.entries()].sort(([a], [b]) => rank(a) - rank(b));
}

export default async function ContactPage() {
  const content = await getSiteContent();
  // Only what the panel marks visible reaches the site (app_content_bundle returns visible rows).
  const groups = groupContacts(content.contacts);

  return (
    <main className="mx-auto flex max-w-[1248px] flex-col gap-14 px-6 pt-14">
      <ContactSection mosque={content.mosque} as="h1" />

      <section className="flex flex-col gap-7">
        <div className="flex flex-col gap-2">
          <Eyebrow>{t.contact.peopleEyebrow}</Eyebrow>
          <h2 className="text-[38px] leading-tight font-extrabold tracking-[-0.8px] text-pm-text">{t.contact.peopleTitle}</h2>
        </div>
        {groups.length === 0 && <p className="text-pm-text-2">{t.contact.noPeople}</p>}
        {groups.map(([group, people]) => (
          <div key={group} className="flex flex-col gap-4">
            <h3 className="text-xl font-extrabold text-pm-text">{t.contact.groups[group] ?? group}</h3>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {people.map((c) => (
                <ContactCard key={c.id} contact={c} />
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  );
}
