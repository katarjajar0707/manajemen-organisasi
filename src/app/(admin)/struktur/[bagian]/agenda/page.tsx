import { notFound } from "next/navigation";
import { createClient, getProfile } from "@/lib/supabase/server";
import { getAgendas } from "@/actions/agenda";
import { BagianAgendaManager } from "@/components/struktur/bagian-agenda-manager";

interface PageProps {
  params: Promise<{
    bagian: string;
  }>;
}

export default async function KelolaAgendaBagianPage({ params }: PageProps) {
  const { bagian: slug } = await params;
  const supabase = await createClient();

  const [{ data: bagianData }, profile] = await Promise.all([
    supabase.from("bagian").select("id, nama, slug").eq("slug", slug).single(),
    getProfile(),
  ]);

  if (!bagianData) {
    notFound();
  }

  const agendas = await getAgendas(slug);

  return (
    <BagianAgendaManager
      bagian={bagianData}
      initialAgendas={agendas}
      userRole={profile?.role || "anggota"}
    />
  );
}
