import type { Metadata } from "next";
import { MailCheckIcon } from "lucide-react";
import { t } from "@/lib/i18n";
import StatusCard from "@/components/site/StatusCard";

export const metadata: Metadata = { title: t.unsubscribe.title, robots: { index: false } };

// Where /api/unsubscribe (links in emails already sent) sends people.
export default async function UnsubscribeSuccess(props: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await props.searchParams;
  return (
    <StatusCard icon={<MailCheckIcon size={26} />} title={t.unsubscribe.title} actions={[{ href: "/", label: t.common.home, primary: true }]}>
      {email && <p className="font-semibold text-pm-text">{t.unsubscribe.text(email)}</p>}
      <p>{t.unsubscribe.note}</p>
      <p className="text-sm text-pm-muted">{t.unsubscribe.help}</p>
    </StatusCard>
  );
}
