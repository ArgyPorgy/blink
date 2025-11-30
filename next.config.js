/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, webpack }) => {
    // Handle client-side fallbacks
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Ignore porto/internal module to avoid resolution errors
    // This connector is not needed for basic wallet functionality
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^porto\/internal$/,
      })
    );
    
    return config;
  },
};

module.exports = nextConfig;


