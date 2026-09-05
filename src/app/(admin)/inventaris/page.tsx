import { getInventarisList, getRiwayatPeminjaman } from "@/actions/inventaris";
import { getProfile } from "@/lib/supabase/server";
import { InventarisManager } from "@/components/inventaris/inventaris-manager";

export const metadata = {
  title: "Inventaris & Aset | Manajemen Organisasi",
  description: "Kelola aset inventaris barang dan riwayat peminjaman karang taruna",
};

export default async function InventarisPage() {
  const [items, riwayat, profile] = await Promise.all([
    getInventarisList(),
    getRiwayatPeminjaman(),
    getProfile(),
  ]);

  return (
    <InventarisManager
      initialItems={items}
      initialRiwayat={riwayat}
      userRole={profile?.role || "anggota"}
      currentUserId={profile?.id}
    />
  );
}
