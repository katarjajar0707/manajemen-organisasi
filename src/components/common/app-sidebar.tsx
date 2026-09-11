'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HOME_NAV_ITEMS, MAIN_NAV_ITEMS, ADMIN_NAV_ITEMS } from '@/constants/navigation';
import { useSidebarStore } from '@/store/sidebar-store';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { useAuthStore } from '@/store/auth-store';
import { ColorThemeSwitcher } from '@/components/common/color-theme-switcher';
import { PreviewImage } from '@/components/common/preview-image';

interface AppSidebarProps {
  userRole?: string;
  userBagianSlug?: string | null;
  orgLogoUrl?: string | null;
  orgName?: string;
}

export function AppSidebar({ userRole: propUserRole, userBagianSlug, orgLogoUrl, orgName }: AppSidebarProps) {
  const pathname = usePathname();
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const storeRole = useAuthStore((s) => s.userRole);
  const userRole = propUserRole || storeRole || 'anggota';

  const isAuthorized = (itemRoles?: string[], bagianSlugs?: string[]) => {
    const hasRoleRestriction = Boolean(itemRoles?.length);
    const hasBagianRestriction = Boolean(bagianSlugs?.length);
    const hasRoleAccess = Boolean(itemRoles?.includes(userRole));
    const hasBagianAccess = Boolean(userBagianSlug && bagianSlugs?.includes(userBagianSlug));

    // Item dengan peran dan bagian dapat dibuka oleh salah satu jalur akses tersebut.
    if (hasRoleRestriction && hasBagianRestriction) return hasRoleAccess || hasBagianAccess;
    if (hasRoleRestriction) return hasRoleAccess;
    if (hasBagianRestriction) return hasBagianAccess;
    return true;
  };

  const navItemClass = (isActive: boolean) =>
    cn(
      'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
      isCollapsed ? 'justify-center w-10 mx-auto px-0' : 'gap-3',
      isActive ? ['bg-primary/10 text-primary', 'border border-primary/20', 'theme-shadow'] : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    );

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn('hidden lg:flex flex-col h-screen min-h-0 border-r border-border/60 bg-sidebar shrink-0', 'transition-[width] duration-200 ease-in-out', isCollapsed ? 'w-[60px]' : 'w-60')}>
        {/* ── PART 1: SIDEBAR HEADER (h-14, sejajar AppHeader) ── */}
        <div className={cn('flex h-14 items-center border-b border-border/60 shrink-0', isCollapsed ? 'justify-center px-0' : 'gap-3 px-4')}>
          {orgLogoUrl ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 overflow-hidden border border-border/80 shadow-xs bg-background">
              <PreviewImage src={orgLogoUrl} alt={orgName || 'Logo'} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', 'text-primary-foreground font-extrabold text-sm tracking-tight')}
              style={{
                backgroundImage: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-strong)))',
                boxShadow: '0 0 16px var(--primary-glow)',
              }}
            >
              KT
            </div>
          )}
          {/* Label brand — disembunyikan saat collapsed */}
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="text-sm font-bold text-foreground truncate">{orgName || 'Manajemen Organisasi'}</div>
            </div>
          )}
        </div>

        {/* ── PART 2: SIDEBAR MENU (scrollable) ── */}
        <div className="app-scroll-container min-h-0 flex-1 overflow-y-auto px-2 py-3 space-y-5">
          {/* Menu Utama */}
          <div>
            {!isCollapsed && <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Menu Utama</p>}
            <nav className={cn('space-y-0.5', isCollapsed && 'px-1.5')}>
              {MAIN_NAV_ITEMS.filter((item) => isAuthorized(item.roles, item.bagianSlugs)).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                return isCollapsed ? (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link href={item.href} className={navItemClass(isActive)}>
                        <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Link key={item.href} href={item.href} className={navItemClass(isActive)}>
                    <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                    <span className="truncate">{item.title}</span>
                    {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary theme-drop-shadow" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Beranda */}
          <div>
            {!isCollapsed && <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Beranda</p>}
            <nav className={cn('space-y-0.5', isCollapsed && 'px-1.5')}>
              {HOME_NAV_ITEMS.filter((item) => isAuthorized(item.roles)).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return isCollapsed ? (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link href={item.href} className={navItemClass(isActive)}>
                        <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Link key={item.href} href={item.href} className={navItemClass(isActive)}>
                    <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                    <span className="truncate">{item.title}</span>
                    {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary theme-drop-shadow" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Menu Administrasi */}
          {ADMIN_NAV_ITEMS.some((item) => isAuthorized(item.roles)) && (
            <div>
              {!isCollapsed && <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Administrasi</p>}
              <nav className={cn('space-y-0.5', isCollapsed ? 'px-0' : 'px-1')}>
                {ADMIN_NAV_ITEMS.filter((item) => isAuthorized(item.roles)).map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href);

                  return isCollapsed ? (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link href={item.href} className={navItemClass(isActive)}>
                          <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link key={item.href} href={item.href} className={navItemClass(isActive)}>
                      <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        <ColorThemeSwitcher isCollapsed={isCollapsed} />
      </aside>
    </TooltipProvider>
  );
}
