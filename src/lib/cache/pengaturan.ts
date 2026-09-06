import { cache } from "react";
import { getPengaturanSistem } from "@/actions/pengaturan";

/**
 * Cached version of getPengaturanSistem for Server Components.
 * Deduplicates calls across the layout and page within a single render pass.
 */
export const getCachedPengaturanSistem = cache(async () => {
  return getPengaturanSistem();
});
