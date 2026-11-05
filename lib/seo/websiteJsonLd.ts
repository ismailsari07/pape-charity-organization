// -------- JSON-LD (Schema.org) --------
export const websiteJsonLd = (lang: "tr" | "en" | "fr") => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  url: lang === "tr" ? "https://papemosque.ca/" : `https://papemosque.ca/${lang}`,
  name: "Turkish Islamic Center Canada",
  inLanguage: lang,
  publisher: {
    "@type": "Organization",
    name: "Turkish Islamic Center Canada",
    logo: {
      "@type": "ImageObject",
      url: "https://papemosque.ca/brand/logo-green-1024.png",
    },
  },
});
