import { Suspense } from 'react';
import { BendaharaDataBridge, BendaharaManager, TransactionRowsSkeleton } from '@/components/bendahara/bendahara-manager';
import { getAgendaCategories, getKeuanganList } from '@/actions/keuangan';
import { getCachedPengaturanSistem } from '@/lib/cache/pengaturan';
import { getProfile } from '@/lib/supabase/server';

async function KeuanganData({ dataPromise }: { dataPromise: ReturnType<typeof loadKeuanganData> }) {
  const data = await dataPromise;
  return <BendaharaDataBridge data={data} />;
}

function loadKeuanganData() {
  return Promise.all([getKeuanganList('bendahara'), getAgendaCategories(), getCachedPengaturanSistem()]).then(([finance, categories, settings]) => ({
    ...finance,
    categories,
    settings,
  }));
}

export default async function KeuanganPage() {
  const profile = await getProfile();
  const canManage = profile?.role === 'admin' || profile?.role === 'ketua' || profile?.bagian?.slug === 'bendahara';

  const dataPromise = loadKeuanganData();

  return (
    <BendaharaManager initialList={[]} initialSaldo={{ masuk: 0, keluar: 0, sisa: 0 }} canManage={canManage}>
      <Suspense fallback={<TransactionRowsSkeleton />}>
        <KeuanganData dataPromise={dataPromise} />
      </Suspense>
    </BendaharaManager>
  );
}
