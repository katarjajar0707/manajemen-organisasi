import type { Metadata } from 'next';
import { getPublicTransparencyData } from '@/actions/transparansi';
import { getCachedPengaturanSistem } from '@/lib/cache/pengaturan';
import { PublicDashboardClient } from '@/components/public/public-dashboard-client';

export const metadata: Metadata = {
  title: 'KartaTuju',
  description: 'Selasa, 04 Agustus 2026',
};

export const revalidate = 60;

export default async function PublicDashboardPage() {
  const [data, settings] = await Promise.all([getPublicTransparencyData(), getCachedPengaturanSistem()]);

  return <PublicDashboardClient initialData={data} settings={settings} />;
}
