import type { Metadata } from "next";
import { HeartIcon } from "lucide-react";
import { getDict } from "@/lib/i18n";
import { localePath, type Lang } from "@/lib/i18n/config";
import StatusCard from "@/components/site/StatusCard";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getDict((await params).lang as Lang).donation.successTitle, robots: { index: false } };
}

// Stripe's success_url: /donation/success in the visitor's language.
export default async function SuccessPage({ params }: Props) {
  const lang = (await params).lang as Lang;
  const t = getDict(lang);
  return (
    <StatusCard icon={<HeartIcon size={26} />} title={t.donation.successTitle} actions={[{ href: localePath(lang, "/"), label: t.common.home, primary: true }]}>
      <p>{t.donation.successText}</p>
    </StatusCard>
  );
}
