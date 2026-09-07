import type { Metadata } from "next";
import { getPublicTransparencyData } from "@/actions/transparansi";
import { getCachedPengaturanSistem } from "@/lib/cache/pengaturan";
import { PublicDashboardClient } from "@/components/public/public-dashboard-client";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedPengaturanSistem();
  const orgName = settings.profil.nama || "Karang Taruna";
  const unit = settings.profil.unitWilayah ? ` - ${settings.profil.unitWilayah}` : "";
  return {
    title: `Portal Transparansi Publik | ${orgName}${unit}`,
    description:
      settings.profil.slogan ||
      "Laporan transparansi keuangan kas, jumlah anggota pemuda aktif, dan jadwal agenda kemasyarakatan",
  };
}

export const revalidate = 60;

export default async function PublicDashboardPage() {
  const [data, settings] = await Promise.all([
    getPublicTransparencyData(),
    getCachedPengaturanSistem(),
  ]);

  return <PublicDashboardClient initialData={data} settings={settings} />;
}

