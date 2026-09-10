import { Suspense } from 'react';
import { BendaharaManager } from '@/components/bendahara/bendahara-manager';
import { getKeuanganList, getAgendaCategories } from '@/actions/keuangan';
import { getCachedPengaturanSistem } from '@/lib/cache/pengaturan';
import { BendaharaDataBridge, TransactionRowsSkeleton } from '@/components/bendahara/bendahara-manager';

async function BendaharaData({ dataPromise }: { dataPromise: ReturnType<typeof loadBendaharaData> }) {
  const data = await dataPromise;
  return <BendaharaDataBridge data={data} />;
}

function loadBendaharaData() {
  return Promise.all([getKeuanganList('bendahara'), getAgendaCategories(), getCachedPengaturanSistem()]).then(([finance, categories, settings]) => ({
    ...finance,
    categories,
    settings,
  }));
}

export default async function BendaharaPage() {
  const dataPromise = loadBendaharaData();

  return (
    <BendaharaManager initialList={[]} initialSaldo={{ masuk: 0, keluar: 0, sisa: 0 }}>
      <Suspense fallback={<TransactionRowsSkeleton />}>
        <BendaharaData dataPromise={dataPromise} />
      </Suspense>
    </BendaharaManager>
  );
}
