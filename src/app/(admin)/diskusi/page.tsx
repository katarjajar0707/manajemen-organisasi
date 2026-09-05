import { getDiskusis } from "@/actions/diskusi";
import { createClient, getProfile } from "@/lib/supabase/server";
import { DiskusiManager } from "@/components/diskusi/diskusi-manager";

export default async function DiskusiPage() {
  const supabase = await createClient();

  const [initialThreads, { data: bagianList }, profile] = await Promise.all([
    getDiskusis(),
    supabase.from("bagian").select("id, nama, slug").order("nama"),
    getProfile(),
  ]);

  return (
    <DiskusiManager
      initialThreads={initialThreads}
      bagianList={bagianList || []}
      userRole={profile?.role || "anggota"}
      currentUserId={profile?.id}
      currentUserBagianId={profile?.bagian_id}
    />
  );
}
