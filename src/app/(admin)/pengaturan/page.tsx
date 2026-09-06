import { PengaturanAdmin } from "@/components/pengaturan/pengaturan-admin";
import {
  getDatabaseStats,
  getRecentAuditLogs,
} from "@/actions/pengaturan";
import { getCachedPengaturanSistem } from "@/lib/cache/pengaturan";
import { getProfile } from "@/lib/supabase/server";

export const metadata = {
  title: "Pengaturan Sistem | Manajemen Organisasi",
  description: "Pengaturan konfigurasi organisasi, hak akses, dan kebijakan operasional khusus administrator",
};

export default async function PengaturanPage() {
  const [settings, stats, logs, profile] = await Promise.all([
    getCachedPengaturanSistem(),
    getDatabaseStats(),
    getRecentAuditLogs(),
    getProfile(),
  ]);

  return (
    <PengaturanAdmin
      initialSettings={settings}
      initialStats={stats}
      initialLogs={logs}
      userRole={profile?.role || "admin"}
    />
  );
}
