import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

export interface BagianOption {
  id: string;
  nama: string;
  slug: string;
}

export const getCachedBagianOptions = cache(async (): Promise<BagianOption[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('bagian').select('id, nama, slug').order('nama');

  if (error) {
    console.error('Error fetching bagian options:', error);
    return [];
  }

  return data || [];
});

export const getCachedBagianBySlug = cache(async (slug: string): Promise<BagianOption | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('bagian').select('id, nama, slug').eq('slug', slug).maybeSingle();

  if (error) {
    console.error('Error fetching bagian by slug:', error);
    return null;
  }

  return data;
});
