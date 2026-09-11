import type { NextConfig } from 'next';
import withPWAInit, { runtimeCaching } from '@ducanh2912/next-pwa';

// App Router responses carry the active user's session and can change on every
// request. Caching HTML/RSC navigation responses in a service worker may replay
// an old error page (or another user's response) after a deployment. Keep the
// PWA cache for static assets only.
const staticRuntimeCaching = runtimeCaching.filter(
  (rule) => !['start-url', 'pages', 'pages-rsc', 'pages-rsc-prefetch'].includes(rule.options?.cacheName || ''),
);

const withPWA = withPWAInit({
  dest: 'public',
  cacheStartUrl: false,
  dynamicStartUrl: false,
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    runtimeCaching: staticRuntimeCaching,
  },
});

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default withPWA(nextConfig);
