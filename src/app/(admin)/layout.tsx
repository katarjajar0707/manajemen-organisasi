import { AppHeader } from "@/components/common/app-header";
import { AppSidebar } from "@/components/common/app-sidebar";
import { AppBottomNav } from "@/components/common/app-bottom-nav";
import { AppMobileNav } from "@/components/common/app-mobile-nav";
import { getProfile } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  return (
    // Fullscreen container — no overflow at root level
    <div className="h-screen flex overflow-hidden bg-background">

      {/* SIDEBAR — sticky full height, split into header + scrollable menu (Desktop) */}
      <AppSidebar />

      {/* MOBILE DRAWER — slide-in overlay menu for mobile & tablet */}
      <AppMobileNav />

      {/* RIGHT COLUMN — takes remaining width, scrolls independently */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* APP HEADER — spans only the right column */}
        <AppHeader userName={profile?.nama} userRole={profile?.role} />

        {/* MAIN CONTENT — scrollable, mobile-optimized padding */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 md:p-6 lg:p-8 pb-20 lg:pb-8 min-w-0 max-w-full">
          <div className="max-w-7xl mx-auto w-full min-w-0">
            {children}
          </div>
        </main>
      </div>

      {/* BOTTOM NAV — mobile only */}
      <AppBottomNav />
    </div>
  );
}
