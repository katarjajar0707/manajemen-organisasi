import { getPengumumanList } from "@/actions/pengumuman";
import { createClient, getProfile } from "@/lib/supabase/server";
import { PengumumanManager } from "@/components/pengumuman/pengumuman-manager";

export default async function PengumumanPage() {
  const supabase = await createClient();

  const [announcements, { data: bagianList }, profile] = await Promise.all([
    getPengumumanList(),
    supabase.from("bagian").select("id, nama, slug").order("nama"),
    getProfile(),
  ]);

  return (
    <PengumumanManager
      initialAnnouncements={announcements}
      bagianList={bagianList || []}
      currentUserId={profile?.id}
      userRole={profile?.role || "anggota"}
      currentUserBagianId={profile?.bagian_id}
    />
  );
}
