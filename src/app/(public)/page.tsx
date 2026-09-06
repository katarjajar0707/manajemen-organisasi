import { getPublicTransparencyData } from "@/actions/transparansi";
import { PublicDashboardClient } from "@/components/public/public-dashboard-client";

export const metadata = {
  title: "Portal Transparansi Publik | Karang Taruna Bhakti Karya",
  description: "Laporan transparansi keuangan kas, jumlah anggota pemuda aktif, dan jadwal agenda kemasyarakatan",
};

// ISR: Cache page for 5 minutes (300 seconds) for super fast public performance
export const revalidate = 300;

export default async function PublicDashboardPage() {
  const data = await getPublicTransparencyData();

  return <PublicDashboardClient initialData={data} />;
}
