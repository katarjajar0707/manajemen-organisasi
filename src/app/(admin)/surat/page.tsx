import { getTemplateSuratList } from "@/actions/surat";
import { getProfile } from "@/lib/supabase/server";
import { SuratManager } from "@/components/surat/surat-manager";

export const metadata = {
  title: "Template Surat & Administrasi | Manajemen Organisasi",
  description: "Kelola template surat resmi dan formulir administrasi karang taruna",
};

export default async function SuratPage() {
  const [templates, profile] = await Promise.all([
    getTemplateSuratList(),
    getProfile(),
  ]);

  return (
    <SuratManager
      initialTemplates={templates}
      userRole={profile?.role || "anggota"}
      currentUserId={profile?.id}
    />
  );
}
