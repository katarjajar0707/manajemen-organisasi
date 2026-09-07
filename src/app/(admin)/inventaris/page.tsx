import { getInventarisList, getRiwayatPeminjaman } from "@/actions/inventaris";
import { getProfile } from "@/lib/supabase/server";
import { getCachedPengaturanSistem } from "@/lib/cache/pengaturan";
import { InventarisManager } from "@/components/inventaris/inventaris-manager";

export const metadata = {
  title: "Inventaris & Aset | Manajemen Organisasi",
  description: "Kelola aset inventaris barang dan riwayat peminjaman karang taruna",
};

export default async function InventarisPage() {
  const [items, riwayat, profile, settings] = await Promise.all([
    getInventarisList(),
    getRiwayatPeminjaman(),
    getProfile(),
    getCachedPengaturanSistem(),
  ]);

  return (
    <InventarisManager
      initialItems={items}
      initialRiwayat={riwayat}
      userRole={profile?.role || "anggota"}
      currentUserId={profile?.id}
      settings={settings}
    />
  );
}

