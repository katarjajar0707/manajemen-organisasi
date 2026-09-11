import type { Metadata } from 'next';
import { PublicLaporanKeuangan } from '@/components/public/public-laporan-keuangan';
import { getCachedPengaturanSistem } from '@/lib/cache/pengaturan';
import { getCachedPublicKeuanganReport } from '@/lib/cache/transparansi';

export const metadata: Metadata = {
  title: 'Laporan Keuangan | KartaTuju',
  description: 'Laporan arus kas organisasi yang dapat diakses publik.',
};

export const revalidate = 60;

export default async function LaporanKeuanganPage() {
  const settings = await getCachedPengaturanSistem();
  const isPublicReportAvailable = settings?.keamanan?.portalPublikAktif !== false && settings?.keamanan?.transparansiKasPublik !== false;
  const report = isPublicReportAvailable ? await getCachedPublicKeuanganReport() : undefined;

  return <PublicLaporanKeuangan settings={settings} report={report} />;
}
