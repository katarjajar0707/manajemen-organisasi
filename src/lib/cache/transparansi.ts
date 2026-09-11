import { revalidateTag, unstable_cache } from 'next/cache';
import { getPublicKeuanganReport, getPublicTransparencyData } from '@/actions/transparansi';

export const PUBLIC_TRANSPARENCY_CACHE_TAG = 'public-transparency';

export function invalidatePublicTransparencyCache() {
  revalidateTag(PUBLIC_TRANSPARENCY_CACHE_TAG, 'max');
}

/**
 * Public, read-only summary shared by the public landing page and dashboards.
 * It is safe to cache server-side because it contains no user/session data.
 */
export const getCachedPublicTransparencyData = unstable_cache(
  async () => getPublicTransparencyData(),
  ['public-transparency-data'],
  {
    revalidate: 60,
    tags: [PUBLIC_TRANSPARENCY_CACHE_TAG],
  },
);

export const getCachedPublicKeuanganReport = unstable_cache(
  async () => getPublicKeuanganReport(),
  ['public-keuangan-report'],
  {
    revalidate: 60,
    tags: [PUBLIC_TRANSPARENCY_CACHE_TAG],
  },
);
