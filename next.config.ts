import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next-release",
  output: "standalone",
  serverExternalPackages: ["playwright"],
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
