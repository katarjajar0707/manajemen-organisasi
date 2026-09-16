import type { Metadata } from 'next';
import { PublicKontakClient } from '@/components/public/public-kontak-client';
import { getCachedPengaturanSistem } from '@/lib/cache/pengaturan';

export const metadata: Metadata = {
  title: 'Kontak & Sekretariat | KartaTuju',
  description: 'Hubungi pengurus atau kunjungi sekretariat untuk layanan, koordinasi, dan aspirasi warga.',
};

export const revalidate = 60;

export default async function KontakPage() {
  const settings = await getCachedPengaturanSistem();

  return <PublicKontakClient settings={settings} />;
}
