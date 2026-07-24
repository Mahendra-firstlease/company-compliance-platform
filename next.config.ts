import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["http://localhost:3000", "https://assets.prebuiltui.com",'192.168.1.14'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.prebuiltui.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
