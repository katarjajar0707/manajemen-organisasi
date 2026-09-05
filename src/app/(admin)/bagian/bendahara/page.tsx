import { BendaharaManager } from "@/components/bendahara/bendahara-manager";
import { getKeuanganList } from "@/actions/keuangan";

export default async function BendaharaPage() {
  const data = await getKeuanganList("bendahara");
  return <BendaharaManager initialList={data.list} initialSaldo={data.saldo} />;
}
