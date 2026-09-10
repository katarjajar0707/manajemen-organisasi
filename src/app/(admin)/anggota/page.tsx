import { Suspense } from "react";
import { getAnggotaList, getAnggotaFormMeta, type AnggotaDetail } from "@/actions/anggota";
import { getProfile } from "@/lib/supabase/server";
import { AnggotaManager, AnggotaMembersBridge, TableRowsSkeleton } from "@/components/anggota/anggota-manager";

async function AnggotaMembersData({ membersPromise }: { membersPromise: Promise<AnggotaDetail[]> }) {
  const members = await membersPromise;
  return <AnggotaMembersBridge members={members} />;
}

export default async function AnggotaPage() {
  const membersPromise = getAnggotaList();
  const [metadata, profile] = await Promise.all([getAnggotaFormMeta(), getProfile()]);

  return (
    <AnggotaManager
      metadata={metadata}
      userRole={profile?.role || "anggota"}
    >
      <Suspense fallback={<TableRowsSkeleton />}>
        <AnggotaMembersData membersPromise={membersPromise} />
      </Suspense>
    </AnggotaManager>
  );
}
