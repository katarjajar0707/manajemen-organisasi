import type { Metadata } from "next";
import { getCachedPengaturanSistem } from "@/lib/cache/pengaturan";
import { LoginClient } from "./login-client";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedPengaturanSistem();
  const orgName = settings.profil.nama || "Karang Taruna";
  return {
    title: `Masuk Portal Pengurus | ${orgName}`,
    description: `Portal autentikasi pengurus dan anggota ${orgName}`,
  };
}

export default async function LoginPage() {
  const settings = await getCachedPengaturanSistem();
  return <LoginClient settings={settings} />;
}

