import { CompassIcon } from "lucide-react";
import { t } from "@/lib/i18n";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { navItems } from "@/components/site/nav";
import StatusCard from "@/components/site/StatusCard";
import { getSiteContent } from "@/lib/server/content";
import RevealScript from "@/components/motion/RevealScript";

// Root 404: unknown URLs and every notFound() (unpublished/expired
// announcements, switched-off sections). Renders outside the (public)
// layout, so it brings the header and footer itself.
export default async function NotFound() {
  const content = await getSiteContent();
  return (
    <>
      <Header items={navItems(content.features)} />
      <StatusCard icon={<CompassIcon size={26} />} eyebrow={t.notFound.eyebrow} title={t.notFound.title} actions={[{ href: "/", label: t.common.home, primary: true }]}>
        <p>{t.notFound.text}</p>
      </StatusCard>
      <Footer features={content.features} links={content.links} />
      <RevealScript />
    </>
  );
}
