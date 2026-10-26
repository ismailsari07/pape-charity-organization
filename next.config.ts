import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    // Announcement photos (public bucket); nothing else is allowed through next/image.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "onczqxxdvmmmdcuhmyio.supabase.co",
        pathname: "/storage/v1/object/public/announcement-images/**",
      },
    ],
  },
};

export default nextConfig;
