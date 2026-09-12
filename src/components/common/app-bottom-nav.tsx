'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid } from 'lucide-react';
import { BOTTOM_NAV_ITEMS } from '@/constants/navigation';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store/sidebar-store';

export function AppBottomNav() {
  const pathname = usePathname();
  const toggleMobile = useSidebarStore((state) => state.toggleMobile);
  const isMobileOpen = useSidebarStore((state) => state.isMobileOpen);
  const profileItem = BOTTOM_NAV_ITEMS.find((item) => item.href === '/profil');
  const regularItems = BOTTOM_NAV_ITEMS.filter((item) => item.href !== '/profil');
  const leftItems = regularItems.slice(0, 2);
  const rightItems = regularItems.slice(2);

  const renderRegularItem = (item: (typeof BOTTOM_NAV_ITEMS)[number]) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;

    return (
      <Link key={item.href} href={item.href} className={cn('group flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium transition-all duration-200 active:scale-95', isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg transition-colors', isActive ? 'bg-primary/10' : 'group-hover:bg-muted')}>
          <Icon className={cn('h-4 w-4 transition-transform duration-200', isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]')} />
        </span>
        <span className="max-w-full truncate px-1 leading-tight">{item.title}</span>
      </Link>
    );
  };

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 px-3 lg:hidden" aria-label="Navigasi utama mobile">
      <div className="pointer-events-auto mx-auto flex h-16 max-w-md items-stretch rounded-2xl border border-border/70 bg-background/95 px-1 shadow-[0_12px_32px_rgba(0,0,0,0.16)] backdrop-blur-xl dark:bg-background/90">
        {leftItems.map(renderRegularItem)}

        {profileItem && (() => {
          const Icon = profileItem.icon;
          const isActive = pathname === profileItem.href;
          return (
            <Link href={profileItem.href} aria-current={isActive ? 'page' : undefined} className="group relative flex min-w-0 flex-1 flex-col items-center justify-end pb-1 text-[10px] font-semibold text-primary transition-transform duration-200 active:scale-95">
              <span className={cn('absolute -top-5 flex h-14 w-14 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-[0_10px_22px_var(--primary-glow)] transition-all duration-200 group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-primary/35 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background', isActive && 'ring-2 ring-primary/25 ring-offset-2 ring-offset-background')}>
                <Icon className={cn('h-5 w-5 transition-transform duration-200', isActive && 'scale-110 stroke-[2.5]')} />
              </span>
              <span className="leading-tight">Profil</span>
            </Link>
          );
        })()}

        {rightItems.map(renderRegularItem)}

        <button type="button" onClick={toggleMobile} aria-expanded={isMobileOpen} aria-label="Buka menu lengkap" className={cn('group flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium transition-all duration-200 active:scale-95', isMobileOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
          <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg transition-colors', isMobileOpen ? 'bg-primary/10' : 'group-hover:bg-muted')}>
            <LayoutGrid className={cn('h-4 w-4 transition-transform duration-200', isMobileOpen ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]')} />
          </span>
          <span className="max-w-full truncate px-1 leading-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
}
