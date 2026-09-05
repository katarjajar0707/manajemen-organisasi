import { PengaturanAdmin } from "@/components/pengaturan/pengaturan-admin";

export const metadata = {
  title: "Pengaturan Sistem | Manajemen Organisasi",
  description: "Pengaturan konfigurasi organisasi, hak akses, dan kebijakan operasional khusus administrator",
};

export default function PengaturanPage() {
  return <PengaturanAdmin />;
}
