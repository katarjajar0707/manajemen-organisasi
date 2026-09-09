import { BendaharaManager } from '@/components/bendahara/bendahara-manager';
import { getKeuanganList, getAgendaCategories } from '@/actions/keuangan';
import { getCachedPengaturanSistem } from '@/lib/cache/pengaturan';

export default async function BendaharaPage() {
  const [data, categories, settings] = await Promise.all([getKeuanganList('bendahara'), getAgendaCategories(), getCachedPengaturanSistem()]);

  return <BendaharaManager initialList={data.list} initialSaldo={data.saldo} bagianId={data.bagianId} agendaCategories={categories} settings={settings} />;
}
