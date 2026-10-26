import type { Metadata } from "next";
import { t } from "@/lib/i18n";
import { getDonationFunds, type DonationFund } from "@/lib/server/funds";
import SectionHeading from "@/components/site/SectionHeading";
import DonationFunds from "@/components/donation/DonationFunds";

// ISR like the other public pages: fund changes show up within about a minute.
export const revalidate = 60;

export const metadata: Metadata = {
  title: t.donation.title,
  description: t.donation.pageIntro,
  alternates: { canonical: "/donation" },
};

export default async function DonationPage() {
  const funds = await getDonationFunds().catch((error): DonationFund[] => {
    console.error("[donation] donation_funds fetch failed", error);
    return [];
  });

  return (
    <main className="mx-auto flex max-w-[1248px] flex-col gap-8 px-6 pt-14">
      <SectionHeading as="h1" eyebrow={t.donation.eyebrow} title={t.donation.title} intro={t.donation.pageIntro} />
      {funds.length === 0 ? <p className="text-pm-text-2">{t.donation.noFunds}</p> : <DonationFunds funds={funds} />}
    </main>
  );
}
