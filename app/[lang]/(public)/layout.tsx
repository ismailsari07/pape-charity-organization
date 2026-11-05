import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { navItems } from "@/components/site/nav";
import { getSiteContent } from "@/lib/server/content";
import RevealScript from "@/components/motion/RevealScript";
import type { Lang } from "@/lib/i18n/config";

// Header/footer read the content bundle (feature flags, links); refresh it
// at most once a minute on every public page, like the page data.
export const revalidate = 60;

export default async function PublicLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang;
  const content = await getSiteContent();
  return (
    <>
      <Header items={navItems(content.features, lang)} />
      {children}
      <Footer features={content.features} links={content.links} lang={lang} />
      {/* Entrance animations for every public page (lib/reveal.ts). */}
      <RevealScript />
    </>
  );
}
