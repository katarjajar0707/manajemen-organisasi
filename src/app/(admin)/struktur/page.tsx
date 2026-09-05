import { StrukturManager } from "@/components/struktur/struktur-manager";
import { getAgendas } from "@/actions/agenda";
import { createClient, getProfile } from "@/lib/supabase/server";

export default async function StrukturOrganisasiPage() {
  const supabase = await createClient();

  const [agendas, { data: bagianList }, profile] = await Promise.all([
    getAgendas(),
    supabase.from("bagian").select("id, nama, slug").order("nama"),
    getProfile(),
  ]);

  return (
    <StrukturManager
      initialAgendas={agendas}
      bagianList={bagianList || []}
      userRole={profile?.role || "anggota"}
    />
  );
}
