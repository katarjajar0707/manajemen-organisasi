'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BOTTOM_NAV_ITEMS } from '@/constants/navigation';
import { cn } from '@/lib/utils';

import { LayoutGrid } from 'lucide-react';
import { useSidebarStore } from '@/store/sidebar-store';

export function AppBottomNav() {
  const pathname = usePathname();
  const toggleMobile = useSidebarStore((s) => s.toggleMobile);
  const isMobileOpen = useSidebarStore((s) => s.isMobileOpen);

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 lg:hidden',
        'border-t border-slate-300 bg-white dark:border-zinc-700 dark:bg-zinc-950',
        // Safe area padding untuk notched phones
        'pb-[env(safe-area-inset-bottom,8px)]',
      )}
    >
      {/* Nav items container */}
      <div className="flex items-end justify-around px-2 pt-1.5 pb-2">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 transition-all duration-300 ease-out',
                'active:scale-90',
                isActive ? 'text-primary' : 'text-slate-600 hover:text-slate-950 dark:text-zinc-300 dark:hover:text-white',
              )}
            >
              {/* Active background pill */}
              <div
                className={cn(
                  'relative flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-300 ease-out',
                  isActive ? 'bg-primary/15 shadow-[0_0_16px_rgba(16,185,129,0.25),0_0_4px_rgba(16,185,129,0.15)] scale-110' : 'group-hover:bg-foreground/[0.06] scale-100',
                )}
              >
                {/* Active dot indicator above icon */}
                <div className={cn('absolute -top-1 left-1/2 -translate-x-1/2 h-1 rounded-full bg-primary transition-all duration-300 ease-out', isActive ? 'w-3 opacity-100' : 'w-0 opacity-0')} />
                <Icon className={cn('transition-all duration-300 ease-out', isActive ? 'h-[18px] w-[18px] stroke-[2.5] text-primary drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'h-4 w-4 stroke-[1.8] group-hover:stroke-2')} />
              </div>
              <span
                className={cn(
                  'text-[10px] leading-tight truncate max-w-[56px] transition-all duration-300 ease-out',
                  isActive ? 'font-bold text-primary translate-y-0 opacity-100' : 'font-medium text-slate-600 translate-y-0.5 dark:text-zinc-300',
                )}
              >
                {item.title}
              </span>
            </Link>
          );
        })}

        {/* Button Menu Lengkap (Drawer) */}
        <button
          type="button"
          onClick={toggleMobile}
          className={cn(
            'group relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 transition-all duration-300 ease-out',
            'active:scale-90',
            isMobileOpen ? 'text-primary' : 'text-slate-600 hover:text-slate-950 dark:text-zinc-300 dark:hover:text-white',
          )}
        >
          {/* Active background pill */}
          <div
            className={cn(
              'relative flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-300 ease-out',
              isMobileOpen ? 'bg-primary/15 shadow-[0_0_16px_rgba(16,185,129,0.25),0_0_4px_rgba(16,185,129,0.15)] scale-110' : 'group-hover:bg-foreground/[0.06] scale-100',
            )}
          >
            {/* Active dot indicator above icon */}
            <div className={cn('absolute -top-1 left-1/2 -translate-x-1/2 h-1 rounded-full bg-primary transition-all duration-300 ease-out', isMobileOpen ? 'w-3 opacity-100' : 'w-0 opacity-0')} />
            <LayoutGrid className={cn('transition-all duration-300 ease-out', isMobileOpen ? 'h-[18px] w-[18px] stroke-[2.5] text-primary drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'h-4 w-4 stroke-[1.8] group-hover:stroke-2')} />
          </div>
          <span
            className={cn(
              'text-[10px] leading-tight truncate max-w-[56px] transition-all duration-300 ease-out',
              isMobileOpen ? 'font-bold text-primary translate-y-0 opacity-100' : 'font-medium text-slate-600 translate-y-0.5 dark:text-zinc-300',
            )}
          >
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
}
