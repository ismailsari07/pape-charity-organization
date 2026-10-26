import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    // Announcement and event photos (public buckets); nothing else is allowed through next/image.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "onczqxxdvmmmdcuhmyio.supabase.co",
        pathname: "/storage/v1/object/public/announcement-images/**",
      },
      {
        protocol: "https",
        hostname: "onczqxxdvmmmdcuhmyio.supabase.co",
        pathname: "/storage/v1/object/public/event-images/**",
      },
    ],
  },
  // Old pages replaced by the redesign; keep old links and search results working.
  async redirects() {
    return [
      { source: "/service", destination: "/services", permanent: true },
      { source: "/about", destination: "/iletisim", permanent: true },
      { source: "/contact", destination: "/iletisim", permanent: true },
      // Events and announcements live under one page with tabs (like the app);
      // announcement detail pages keep their /announcements/[id] URLs.
      { source: "/events", destination: "/community", permanent: true },
      { source: "/announcements", destination: "/community?tab=duyurular", permanent: true },
    ];
  },
};

export default nextConfig;
