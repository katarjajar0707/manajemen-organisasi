"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV_ITEMS, ADMIN_NAV_ITEMS } from "@/constants/navigation";
import { useSidebarStore } from "@/store/sidebar-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";
import { X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppMobileNav() {
  const pathname = usePathname();
  const isMobileOpen = useSidebarStore((s) => s.isMobileOpen);
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);
  const userRole = useAuthStore((s) => s.userRole) || "admin";
  const userName = useAuthStore((s) => s.userName) || "Azzam Azhari";

  // Tutup drawer saat URL berubah
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  // Tutup drawer saat tombol ESC ditekan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, setMobileOpen]);

  // Kunci scroll body saat drawer terbuka di mobile
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const isAuthorized = (itemRoles?: string[]) => {
    if (!itemRoles || itemRoles.length === 0) return true;
    return itemRoles.includes(userRole);
  };

  const navItemClass = (isActive: boolean) =>
    cn(
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
      isActive
        ? [
            "bg-primary/10 text-primary font-semibold",
            "border border-primary/20",
            "shadow-[0_0_12px_rgba(16,185,129,0.15)]",
          ]
        : "text-foreground/80 hover:bg-accent hover:text-foreground active:scale-[0.99]"
    );

  if (!isMobileOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        className={cn(
          "relative z-10 w-[85vw] max-w-72 bg-background border-r border-border h-full flex flex-col shadow-2xl",
          "animate-in slide-in-from-left duration-250 ease-out"
        )}
      >
        {/* Drawer Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-400 text-primary-foreground font-extrabold text-sm shadow-[0_0_16px_rgba(16,185,129,0.3)]">
              KT
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Manajemen Organisasi</div>
              <div className="text-[11px] text-muted-foreground">Portal Pengurus Karang Taruna</div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Tutup menu</span>
          </Button>
        </div>

        {/* User Card */}
        <div className="p-3 mx-3 mt-3 rounded-xl bg-muted/50 border border-border/60 shrink-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-semibold text-foreground truncate">{userName}</p>
              <p className="text-[10px] text-muted-foreground capitalize flex items-center gap-1 mt-0.5">
                <Shield className="h-3 w-3 text-primary" />
                Role: {userRole}
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/20">
              {userRole}
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5 pb-8">
          {/* Menu Utama */}
          <div>
            <p className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Menu Utama
            </p>
            <nav className="space-y-1">
              {MAIN_NAV_ITEMS.filter((item) => isAuthorized(item.roles)).map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={navItemClass(isActive)}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span className="truncate flex-1">{item.title}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Menu Administrasi */}
          {ADMIN_NAV_ITEMS.some((item) => isAuthorized(item.roles)) && (
            <div>
              <p className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Administrasi Khusus
              </p>
              <nav className="space-y-1">
                {ADMIN_NAV_ITEMS.filter((item) => isAuthorized(item.roles)).map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href || pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={navItemClass(isActive)}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                      <span className="truncate flex-1">{item.title}</span>
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border/70 text-center shrink-0">
          <p className="text-[10px] text-muted-foreground/60 font-mono">
            Karang Taruna App · Responsive v1.1
          </p>
        </div>
      </aside>
    </div>
  );
}
