import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Manrope } from "next/font/google";
import "@/app/globals.css";
import LangProvider from "@/components/i18n/LangProvider";
import { clientMessages, getDict } from "@/lib/i18n";
import { isLang, LANGS, type Lang } from "@/lib/i18n/config";
import { websiteJsonLd } from "@/lib/seo/websiteJsonLd";
import { mosqueJsonLd } from "@/lib/seo/mosqueJsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbJsonLd";

// Variable font: every weight from 400 to 800 in one file.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
});

type Params = { params: Promise<{ lang: string }> };

// The root layout, because <html lang> depends on the language. Turkish is
// served from /tr internally (middleware.ts) and never appears in a URL.
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { seo } = getDict((await params).lang as Lang);
  return {
    metadataBase: new URL("https://papemosque.ca"),
    title: {
      default: seo.siteName,
      template: `%s | ${seo.siteName}`,
    },
    description: seo.description,
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
        { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    manifest: "/site.webmanifest",
  };
}

export default async function RootLayout({ children, params }: Readonly<{ children: React.ReactNode } & Params>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html lang={lang}>
      <body className={`${manrope.variable} antialiased font-sans`}>
        <LangProvider lang={lang} messages={clientMessages(lang)}>
          {children}
        </LangProvider>

        <Script
          id="ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd(lang)) }}
        />
        <Script
          id="ld-mosque"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(mosqueJsonLd) }}
        />
        <Script
          id="ld-breadcrumbs"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(lang)) }}
        />
      </body>
    </html>
  );
}
