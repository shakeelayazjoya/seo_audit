const nextConfig = {
  reactStrictMode: false,

  output: 'standalone',
  serverExternalPackages: ['playwright', 'playwright-core', 'lighthouse', 'chrome-launcher'],

  typescript: {
    ignoreBuildErrors: true
  },

  images: {
    unoptimized: true
  },

  outputFileTracingIncludes: {
    '/api/report/[id]': [
      './node_modules/playwright-core/.local-browsers/**/*',
      './node_modules/playwright/.local-browsers/**/*',
    ],
    '/api/report/[id]/send': [
      './node_modules/playwright-core/.local-browsers/**/*',
      './node_modules/playwright/.local-browsers/**/*',
    ],
  },
};

export default nextConfig;
