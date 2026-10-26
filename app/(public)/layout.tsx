import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { navItems } from "@/components/site/nav";
import { getSiteContent } from "@/lib/server/content";
import RevealScript from "@/components/motion/RevealScript";

// Header/footer read the content bundle (feature flags, links); refresh it
// at most once a minute on every public page, like the page data.
export const revalidate = 60;

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  return (
    <>
      <Header items={navItems(content.features)} />
      {children}
      <Footer features={content.features} links={content.links} />
      {/* Entrance animations for every public page (lib/reveal.ts). */}
      <RevealScript />
    </>
  );
}
