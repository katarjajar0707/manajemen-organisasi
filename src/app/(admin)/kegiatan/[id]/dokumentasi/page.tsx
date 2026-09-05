import { notFound } from "next/navigation";
import { getKegiatanById } from "@/actions/kegiatan";
import { getProfile } from "@/lib/supabase/server";
import { DokumentasiManager } from "@/components/kegiatan/dokumentasi-manager";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DokumentasiKegiatanPage({ params }: PageProps) {
  const { id } = await params;

  const [kegiatan, profile] = await Promise.all([
    getKegiatanById(id),
    getProfile(),
  ]);

  if (!kegiatan) {
    notFound();
  }

  return (
    <DokumentasiManager
      kegiatan={kegiatan}
      initialFotos={kegiatan.dokumentasi_kegiatan || []}
      userRole={profile?.role || "anggota"}
    />
  );
}
