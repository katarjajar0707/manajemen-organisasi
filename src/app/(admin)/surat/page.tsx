import { getTemplateSuratList } from "@/actions/surat";
import { getProfile } from "@/lib/supabase/server";
import { getCachedPengaturanSistem } from "@/lib/cache/pengaturan";
import { SuratManager } from "@/components/surat/surat-manager";

export const metadata = {
  title: "Template Surat & Administrasi | Manajemen Organisasi",
  description: "Kelola template surat resmi dan formulir administrasi karang taruna",
};

export default async function SuratPage() {
  const [templates, profile, settings] = await Promise.all([
    getTemplateSuratList(),
    getProfile(),
    getCachedPengaturanSistem(),
  ]);

  return (
    <SuratManager
      initialTemplates={templates}
      userRole={profile?.role || "anggota"}
      currentUserId={profile?.id}
      settings={settings}
    />
  );
}

