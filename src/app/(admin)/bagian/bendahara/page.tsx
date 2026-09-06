import { BendaharaManager } from "@/components/bendahara/bendahara-manager";
import { getKeuanganList, getAgendaCategories } from "@/actions/keuangan";

export const dynamic = "force-dynamic";

export default async function BendaharaPage() {
  const [data, categories] = await Promise.all([
    getKeuanganList("bendahara"),
    getAgendaCategories(),
  ]);

  return (
    <BendaharaManager
      initialList={data.list}
      initialSaldo={data.saldo}
      agendaCategories={categories}
    />
  );
}
