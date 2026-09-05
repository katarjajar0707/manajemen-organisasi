"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV_ITEMS, ADMIN_NAV_ITEMS } from "@/constants/navigation";
import { useSidebarStore } from "@/store/sidebar-store";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useAuthStore } from "@/store/auth-store";

export function AppSidebar() {
  const pathname = usePathname();
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const userRole = useAuthStore((s) => s.userRole) || "admin";

  const isAuthorized = (itemRoles?: string[]) => {
    if (!itemRoles || itemRoles.length === 0) return true;
    return itemRoles.includes(userRole);
  };

  const navItemClass = (isActive: boolean) =>
    cn(
      "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
      isCollapsed ? "justify-center w-10 mx-auto px-0" : "gap-3",
      isActive
        ? [
            "bg-primary/10 text-primary",
            "border border-primary/20",
            "shadow-[0_0_12px_rgba(16,185,129,0.12)]",
          ]
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    );

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen border-r border-border/60 bg-sidebar shrink-0",
          "transition-[width] duration-200 ease-in-out",
          isCollapsed ? "w-[60px]" : "w-60"
        )}
      >
        {/* ── PART 1: SIDEBAR HEADER (h-14, sejajar AppHeader) ── */}
        <div className={cn(
          "flex h-14 items-center border-b border-border/60 shrink-0",
          isCollapsed ? "justify-center px-0" : "gap-3 px-4"
        )}>
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
            "bg-gradient-to-br from-primary to-emerald-400",
            "text-primary-foreground font-extrabold text-sm tracking-tight",
            "shadow-[0_0_16px_rgba(16,185,129,0.3)]"
          )}>
            KT
          </div>
          {/* Label brand — disembunyikan saat collapsed */}
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="text-sm font-bold text-foreground truncate">Manajemen Organisasi</div>
              <div className="text-[10px] text-muted-foreground font-mono">v1.0 · Portal Pengurus</div>
            </div>
          )}
        </div>

        {/* ── PART 2: SIDEBAR MENU (scrollable) ── */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5">

          {/* Menu Utama */}
          <div>
            {!isCollapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Menu Utama
              </p>
            )}
            <nav className={cn("space-y-0.5", isCollapsed && "px-1.5")}>
              {MAIN_NAV_ITEMS.filter((item) => isAuthorized(item.roles)).map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return isCollapsed ? (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link href={item.href} className={navItemClass(isActive)}>
                        <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Link key={item.href} href={item.href} className={navItemClass(isActive)}>
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span className="truncate">{item.title}</span>
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Menu Administrasi */}
          <div>
            {!isCollapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Administrasi
              </p>
            )}
            <nav className={cn("space-y-0.5", isCollapsed ? "px-0" : "px-1")}>
              {ADMIN_NAV_ITEMS.filter((item) => isAuthorized(item.roles)).map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href);

                return isCollapsed ? (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link href={item.href} className={navItemClass(isActive)}>
                        <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Link key={item.href} href={item.href} className={navItemClass(isActive)}>
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ── BOTTOM: Version tag ── */}
        <div className={cn(
          "border-t border-border/60 shrink-0 py-2.5",
          isCollapsed ? "px-0 text-center" : "px-4"
        )}>
          {isCollapsed ? (
            <div className="h-2 w-2 rounded-full bg-primary/30 mx-auto" />
          ) : (
            <p className="text-[10px] font-mono text-muted-foreground/40 text-center">
              Fase 1 Setup · Ready
            </p>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
