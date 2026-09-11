import { getBagianList } from "@/actions/bagian";
import { getProfile } from "@/lib/supabase/server";
import { BagianManager } from "@/components/bagian/bagian-manager";

export const metadata = {
  title: "Kelola Bagian Organisasi | Manajemen Organisasi",
  description: "Daftar dan manajemen bagian/divisi yang aktif dalam Karang Taruna",
};

export default async function BagianManagementPage() {
  const [departments, profile] = await Promise.all([
    getBagianList(),
    getProfile(),
  ]);

  return (
    <BagianManager
      initialBagian={departments}
      userRole={profile?.role || "anggota"}
      currentUserBagianSlug={profile?.bagian?.slug}
    />
  );
}
