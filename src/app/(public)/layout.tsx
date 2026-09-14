import { Navbar } from '@/components/public/navbar';
import { getCachedPengaturanSistem } from '@/lib/cache/pengaturan';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getCachedPengaturanSistem();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar orgLogoUrl={settings.profil.logoUrl} orgName={settings.profil.nama} />
      {children}
    </div>
  );
}
