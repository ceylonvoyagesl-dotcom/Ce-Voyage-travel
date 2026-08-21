import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Arena live previews are proxied through an e2b.app subdomain.
  allowedDevOrigins: ["*.e2b.app"],
};

export default nextConfig;
