import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  serverExternalPackages: ["playwright", "nodemailer"],

  reactStrictMode: false,
};

export default nextConfig;