import type { Metadata } from "next";
import Script from "next/script";
import { Lato, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AuthProvider } from "@/components/AuthProvider";
import { websiteJsonLd } from "@/lib/seo/websiteJsonLd";
import { mosqueJsonLd } from "@/lib/seo/mosqueJsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/breadcrumbJsonLd";
import { Toaster } from "@/components/ui/sonner";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-sans",
  subsets: ["latin"],
});

const lato = Lato({
  weight: "400",
  variable: "--font-lato-sans",
  subsets: ["latin"],
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
    <html lang="en">
      <body
        className={`${lato.variable} ${bricolageGrotesque.variable} antialiased font-sans`}
      >
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
        <Toaster position="top-center" richColors />

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
