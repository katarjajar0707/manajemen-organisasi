import { Suspense } from 'react';
import { AppHeader } from '@/components/common/app-header';
import { AppSidebar } from '@/components/common/app-sidebar';
import { AppBottomNav } from '@/components/common/app-bottom-nav';
import { AppMobileNav } from '@/components/common/app-mobile-nav';
import { getProfile } from '@/lib/supabase/server';
import { getCachedPengaturanSistem } from '@/lib/cache/pengaturan';
import { AdminQueryProvider } from '@/providers/admin-query-provider';

export const dynamic = 'force-dynamic';

async function AdminSidebarChrome() {
  const [profile, settings] = await Promise.all([getProfile(), getCachedPengaturanSistem()]);

  return (
    <>
      <AppSidebar userRole={profile?.role} orgLogoUrl={settings.profil.logoUrl} orgName={settings.profil.nama} />
      <AppMobileNav userRole={profile?.role} orgLogoUrl={settings.profil.logoUrl} orgName={settings.profil.nama} />
    </>
  );
}

async function AdminHeaderChrome() {
  const profile = await getProfile();
  return <AppHeader userName={profile?.nama} userRole={profile?.role} userAvatarUrl={profile?.foto_url} userDepartemen={profile?.bagian?.nama} />;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminQueryProvider>
      {/* Fullscreen container — no overflow at root level */}
      <div className="h-screen min-h-0 flex overflow-hidden bg-background">
        {/* The shell is interactive immediately; session-backed chrome streams in separately. */}
        <Suspense
          fallback={
            <>
              <AppSidebar />
              <AppMobileNav />
            </>
          }
        >
          <AdminSidebarChrome />
        </Suspense>

        {/* RIGHT COLUMN — takes remaining width, scrolls independently */}
        <div className="flex-1 min-h-0 flex flex-col min-w-0 overflow-hidden">
          <Suspense fallback={<AppHeader />}>
            <AdminHeaderChrome />
          </Suspense>

          {/* MAIN CONTENT — scrollable, mobile-optimized padding */}
          <main className="app-scroll-container flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 md:p-6 lg:p-8 pb-24 lg:pb-8 min-w-0 max-w-full">
            <div className="max-w-7xl mx-auto w-full min-w-0">{children}</div>
          </main>
        </div>

        {/* BOTTOM NAV — mobile only */}
        <AppBottomNav />
      </div>
    </AdminQueryProvider>
  );
}
