import type { Metadata } from "next";
import { MailCheckIcon } from "lucide-react";
import { getDict } from "@/lib/i18n";
import { localePath, type Lang } from "@/lib/i18n/config";
import { getSiteContent } from "@/lib/server/content";
import StatusCard from "@/components/site/StatusCard";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getDict((await params).lang as Lang).account.confirmedTitle, robots: { index: false, follow: false } };
}

// Where the app's sign-up confirmation email lands when it opens in a browser
// instead of the app. The App Store button appears once the panel has links.app_store.
export default async function AccountConfirmed({ params }: Props) {
  const lang = (await params).lang as Lang;
  const t = getDict(lang);
  const appStore = (await getSiteContent()).links.app_store;
  return (
    <StatusCard
      icon={<MailCheckIcon size={26} />}
      title={t.account.confirmedTitle}
      actions={[
        ...(appStore ? [{ href: appStore, label: t.app.appStore, primary: true }] : []),
        { href: localePath(lang, "/"), label: t.common.home, primary: !appStore },
      ]}
    >
      <p>{t.account.confirmedText}</p>
    </StatusCard>
  );
}
