import type { NextConfig } from 'next';
import withPWAInit, { runtimeCaching } from '@ducanh2912/next-pwa';

// App Router responses for dynamic admin sessions shouldn't be permanently cached.
// But the public landing page ('/') and public routes should use NetworkFirst with
// a fast network timeout so installed PWAs launch instantly on mobile devices.
const staticRuntimeCaching = runtimeCaching.filter(
  (rule) => !['start-url', 'pages', 'pages-rsc', 'pages-rsc-prefetch'].includes(rule.options?.cacheName || ''),
);

const pwaRuntimeCaching = [
  // 1. Caching untuk landing page publik dan rute publik PWA (NetworkFirst, fallback ke cache cepat)
  {
    urlPattern: ({ url: { pathname }, sameOrigin }: any) =>
      sameOrigin && (pathname === '/' || pathname === '/kontak' || pathname === '/laporan-keuangan'),
    handler: 'NetworkFirst' as const,
    options: {
      cacheName: 'public-pages-cache',
      networkTimeoutSeconds: 2.5,
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 24 * 60 * 60,
      },
    },
  },
  // 2. Asset statis bawaan Workbox (images, styles, static JS chunks, fonts)
  ...staticRuntimeCaching,
];

const withPWA = withPWAInit({
  dest: 'public',
  cacheStartUrl: true,
  dynamicStartUrl: false,
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    runtimeCaching: pwaRuntimeCaching,
    exclude: [
      /\.map$/,
      /^manifest.*\.js$/,
      /.*rapier.*/i,
      /.*heic2any.*/i,
    ],
  },
});

const nextConfig: NextConfig = {
  turbopack: {},
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
