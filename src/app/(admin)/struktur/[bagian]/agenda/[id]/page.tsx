import { notFound } from "next/navigation";
import { getAgendaById } from "@/actions/agenda";
import { getProfile } from "@/lib/supabase/server";
import { BaganDetailManager } from "@/components/struktur/bagan-detail-manager";

interface PageProps {
  params: Promise<{
    bagian: string;
    id: string;
  }>;
}

export default async function PeriodeBaganPage({ params }: PageProps) {
  const { bagian, id } = await params;

  const [agenda, profile] = await Promise.all([
    getAgendaById(id),
    getProfile(),
  ]);

  if (!agenda) {
    notFound();
  }

  return (
    <BaganDetailManager
      bagian={bagian}
      id={id}
      initialAgenda={agenda}
      userRole={profile?.role || "anggota"}
    />
  );
}
