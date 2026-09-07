import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/providers";
import { getCachedPengaturanSistem } from "@/lib/cache/pengaturan";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedPengaturanSistem();
  const orgName = settings.profil.nama || "Manajemen Organisasi";
  return {
    title: {
      default: orgName,
      template: `%s | ${orgName}`,
    },
    description:
      settings.profil.slogan ||
      "Sistem kelola kegiatan, keuangan, struktur organisasi, dan transparansi karang taruna",
  };
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
