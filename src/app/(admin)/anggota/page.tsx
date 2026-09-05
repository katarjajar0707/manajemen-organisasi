import { getAnggotaList, getAnggotaFormMeta } from "@/actions/anggota";
import { getProfile } from "@/lib/supabase/server";
import { AnggotaManager } from "@/components/anggota/anggota-manager";

export default async function AnggotaPage() {
  const [members, metadata, profile] = await Promise.all([
    getAnggotaList(),
    getAnggotaFormMeta(),
    getProfile(),
  ]);

  return (
    <AnggotaManager
      initialMembers={members}
      metadata={metadata}
      userRole={profile?.role || "anggota"}
    />
  );
}
