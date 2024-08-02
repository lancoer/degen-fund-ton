const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // webpack: (config) => {
  //   config.resolve.alias["crypto"] = "crypto-browserify";
  //   config.resolve.alias["stream"] = "stream-browserify";
  //   config.resolve.alias["https"] = "https-browserify";
  //   config.resolve.alias["http"] = "http-browserify";
  //   config.resolve.alias["zlib"] = "browserify-zlib";
  //   config.resolve.alias["vm"] = "vm-browserify";

  //   config.externals.push("pino-pretty", "lokijs", "encoding");

  //   return config;
  // },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    // Fixes npm packages that depend on `fs` module
    config.resolve.fallback = { fs: false };

    return config;
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = withSentryConfig(nextConfig, {
  org: 'arcsys',
  project: 'degen-fund',
  hideSourceMaps: true,
  // An auth token is required for uploading source maps.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  tunnelRoute: '/monitoring-tunnel',
  silent: false, // Can be used to suppress logs
});
