import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next-release",
  output: "standalone",
  serverExternalPackages: ["playwright", "nodemailer"],
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
