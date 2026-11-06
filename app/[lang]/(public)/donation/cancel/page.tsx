import type { Metadata } from "next";
import { XIcon } from "lucide-react";
import { getDict } from "@/lib/i18n";
import { localePath, type Lang } from "@/lib/i18n/config";
import StatusCard from "@/components/site/StatusCard";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getDict((await params).lang as Lang).donation.cancelTitle, robots: { index: false } };
}

// Stripe's cancel_url: /donation/cancel in the visitor's language.
export default async function CancelPage({ params }: Props) {
  const lang = (await params).lang as Lang;
  const t = getDict(lang);
  return (
    <StatusCard
      icon={<XIcon size={26} />}
      title={t.donation.cancelTitle}
      actions={[
        { href: localePath(lang, "/donation"), label: t.donation.backToDonation, primary: true },
        { href: localePath(lang, "/"), label: t.common.home },
      ]}
    >
      <p>{t.donation.cancelText}</p>
    </StatusCard>
  );
}
