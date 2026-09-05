import { InventarisManager } from "@/components/inventaris/inventaris-manager";

export const metadata = {
  title: "Inventaris & Aset | Manajemen Organisasi",
  description: "Kelola aset inventaris barang dan riwayat peminjaman karang taruna",
};

export default function InventarisPage() {
  return <InventarisManager />;
}

