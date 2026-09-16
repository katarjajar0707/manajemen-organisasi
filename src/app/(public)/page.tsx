import type { Metadata } from 'next';
import { getCachedPengaturanSistem } from '@/lib/cache/pengaturan';
import { getCachedPublicTransparencyData } from '@/lib/cache/transparansi';
import { getProfile } from '@/lib/supabase/server';
import { PublicDashboardClient } from '@/components/public/public-dashboard-client';

export const metadata: Metadata = {
  title: 'KartaTuju',
  description: 'Selasa, 04 Agustus 2026',
};

export const revalidate = 60;

export default async function PublicDashboardPage() {
  const [data, settings, profile] = await Promise.all([
    getCachedPublicTransparencyData(),
    getCachedPengaturanSistem(),
    getProfile(),
  ]);

  return (
    <PublicDashboardClient
      initialData={data}
      settings={settings}
      currentUserId={profile?.id || null}
    />
  );
}
