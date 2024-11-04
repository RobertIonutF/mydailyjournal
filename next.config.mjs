/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle pg in the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        pg: false,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
