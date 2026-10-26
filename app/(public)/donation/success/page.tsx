import type { Metadata } from "next";
import { HeartIcon } from "lucide-react";
import { t } from "@/lib/i18n";
import StatusCard from "@/components/site/StatusCard";

export const metadata: Metadata = { title: t.donation.successTitle, robots: { index: false } };

// Stripe's success_url (unchanged: /donation/success).
export default function SuccessPage() {
  return (
    <StatusCard icon={<HeartIcon size={26} />} title={t.donation.successTitle} actions={[{ href: "/", label: t.common.home, primary: true }]}>
      <p>{t.donation.successText}</p>
    </StatusCard>
  );
}
