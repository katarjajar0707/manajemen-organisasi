import { Navbar } from '@/components/public/navbar';
import { getCachedPengaturanSistem } from '@/lib/cache/pengaturan';
import { getProfile } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, profile] = await Promise.all([getCachedPengaturanSistem(), getProfile()]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar orgLogoUrl={settings.profil.logoUrl} orgName={settings.profil.nama} isLoggedIn={!!profile} />
      {children}
    </div>
  );
}
