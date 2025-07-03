import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "blogger-wph-api-production.up.railway.app",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "blogger-wph-api-production.up.railway.app",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;