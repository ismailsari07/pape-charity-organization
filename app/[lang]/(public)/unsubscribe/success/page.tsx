import type { Metadata } from "next";
import { MailCheckIcon } from "lucide-react";
import { getDict } from "@/lib/i18n";
import { localePath, type Lang } from "@/lib/i18n/config";
import StatusCard from "@/components/site/StatusCard";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return { title: getDict((await params).lang as Lang).unsubscribe.title, robots: { index: false } };
}

// Where /api/unsubscribe (links in emails already sent) sends people.
export default async function UnsubscribeSuccess(props: { params: Promise<{ lang: string }>; searchParams: Promise<{ email?: string }> }) {
  const lang = (await props.params).lang as Lang;
  const t = getDict(lang);
  const { email } = await props.searchParams;
  return (
    <StatusCard icon={<MailCheckIcon size={26} />} title={t.unsubscribe.title} actions={[{ href: localePath(lang, "/"), label: t.common.home, primary: true }]}>
      {email && <p className="font-semibold text-pm-text">{t.unsubscribe.text(email)}</p>}
      <p>{t.unsubscribe.note}</p>
      <p className="text-sm text-pm-muted">{t.unsubscribe.help}</p>
    </StatusCard>
  );
}
