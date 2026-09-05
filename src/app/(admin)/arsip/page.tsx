import { getArsipList } from "@/actions/arsip";
import { getAgendas } from "@/actions/agenda";
import { getProfile } from "@/lib/supabase/server";
import { ArsipManager } from "@/components/arsip/arsip-manager";

export const metadata = {
  title: "Arsip Dokumen | Manajemen Organisasi",
  description: "Pusat penyimpanan dokumen resmi, SK kepengurusan, proposal, LPJ, dan notulensi organisasi",
};

export default async function ArsipDokumenPage() {
  const [archives, agendas, profile] = await Promise.all([
    getArsipList(),
    getAgendas(),
    getProfile(),
  ]);

  return (
    <ArsipManager
      initialArchives={archives}
      agendaList={agendas.map((a) => ({ id: a.id, nama: a.nama }))}
      userRole={profile?.role || "anggota"}
      currentUserId={profile?.id}
    />
  );
}
