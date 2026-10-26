import type { Metadata } from "next";
import Script from "next/script";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { websiteJsonLd } from "@/lib/seo/websiteJsonLd";
import { mosqueJsonLd } from "@/lib/seo/mosqueJsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbJsonLd";

// Variable font: every weight from 400 to 800 in one file.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://papemosque.ca"),
  title: {
    default: "Turkish Islamic Center Canada",
    template: "%s | Turkish Islamic Center Canada",
  },
  description:
    "Turkish Islamic Center Canada (Pape Camii), Toronto’da 24 saat açık ibadet imkânı, Kur’an dersleri, cemaat buluşmaları ve bağış bilgileri sunar.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://papemosque.ca/",
    siteName: "Turkish Islamic Center Canada",
    title: "Turkish Islamic Center Canada",
    description:
      "Turkish Islamic Center Canada (Pape Camii), Toronto’da 24 saat açık ibadet imkânı, Kur’an dersleri, cemaat buluşmaları ve bağış bilgileri sunar.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Turkish Islamic Center Canada",
    description:
      "Turkish Islamic Center Canada (Pape Camii), Toronto’da 24 saat açık ibadet imkânı, Kur’an dersleri, cemaat buluşmaları ve bağış bilgileri sunar.",
  },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${manrope.variable} antialiased font-sans`}>
        <Providers>
          {children}
        </Providers>

        <Script
          id="ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Script
          id="ld-mosque"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(mosqueJsonLd) }}
        />
        <Script
          id="ld-breadcrumbs"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </body>
    </html>
  );
}
