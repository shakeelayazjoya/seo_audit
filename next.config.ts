const nextConfig = {
  reactStrictMode: false,

  output: 'standalone',

  typescript: {
    ignoreBuildErrors: true
  },

  images: {
    unoptimized: true
  }
};

export default nextConfig;