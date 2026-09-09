import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { getPengaturanSistem } from '@/actions/pengaturan';
import { SYSTEM_SETTINGS_CACHE_TAG } from '@/lib/cache/tags';

/**
 * Cached version of getPengaturanSistem for Server Components.
 * Deduplicates calls across the layout and page within a single render pass.
 */
const getCachedPengaturanSistemPersistent = unstable_cache(async () => getPengaturanSistem(), ['system-settings'], {
  revalidate: 300,
  tags: [SYSTEM_SETTINGS_CACHE_TAG],
});

export const getCachedPengaturanSistem = cache(async () => getCachedPengaturanSistemPersistent());
