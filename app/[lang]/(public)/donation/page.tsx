import { getDict } from "@/lib/i18n";
import { type Lang } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import { getDonationFunds, type DonationFund } from "@/lib/server/funds";
import SectionHeading from "@/components/site/SectionHeading";
import DonationFunds from "@/components/donation/DonationFunds";
import { reveal } from "@/lib/reveal";

// ISR like the other public pages: fund changes show up within about a minute.
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang;
  const t = getDict(lang);
  return pageMetadata(lang, "/donation", { title: t.donation.title, description: t.donation.pageIntro });
}

type Props = { params: Promise<{ lang: string }> };

export default async function DonationPage({ params }: Props) {
  const lang = (await params).lang as Lang;
  const t = getDict(lang);
  const funds = await getDonationFunds(lang).catch((error): DonationFund[] => {
    console.error("[donation] donation_funds fetch failed", error);
    return [];
  });

  return (
    <main className="mx-auto flex max-w-[1248px] flex-col gap-8 px-6 pt-14">
      <SectionHeading as="h1" eyebrow={t.donation.eyebrow} title={t.donation.title} intro={t.donation.pageIntro} />
      {funds.length === 0 ? (
        <p className="text-pm-text-2" {...reveal("up")}>
          {t.donation.noFunds}
        </p>
      ) : (
        <DonationFunds funds={funds} />
      )}

    </main>
  );
}
