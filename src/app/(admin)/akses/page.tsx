import { ManajemenAkses } from "@/components/akses/manajemen-akses";
import { getProfile } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Manajemen Hak Akses | Manajemen Organisasi",
  description: "Pengaturan izin akses halaman dan visibilitas menu pengurus karang taruna",
};

export default async function AksesPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }
  return <ManajemenAkses />;
}

