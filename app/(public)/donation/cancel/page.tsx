import type { Metadata } from "next";
import { XIcon } from "lucide-react";
import { t } from "@/lib/i18n";
import StatusCard from "@/components/site/StatusCard";

export const metadata: Metadata = { title: t.donation.cancelTitle, robots: { index: false } };

// Stripe's cancel_url (unchanged: /donation/cancel).
export default function CancelPage() {
  return (
    <StatusCard
      icon={<XIcon size={26} />}
      title={t.donation.cancelTitle}
      actions={[
        { href: "/donation", label: t.donation.backToDonation, primary: true },
        { href: "/", label: t.common.home },
      ]}
    >
      <p>{t.donation.cancelText}</p>
    </StatusCard>
  );
}
