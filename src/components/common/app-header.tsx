"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Moon, PanelLeft, Settings, Sun, User } from "lucide-react";
import { useSidebarStore } from "@/store/sidebar-store";
import { cn } from "@/lib/utils";
import React from "react";

// Map segment URL → label yang terbaca
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  keuangan: "Keuangan",
  anggota: "Anggota",
  struktur: "Struktur",
  kegiatan: "Kegiatan",
  diskusi: "Diskusi",
  inventaris: "Inventaris",
  arsip: "Arsip & Surat",
  surat: "Surat",
  pengumuman: "Pengumuman",
  pengguna: "Pengguna",
  bagian: "Bagian",
  bendahara: "Bendahara",
  masuk: "Kas Masuk",
  keluar: "Kas Keluar",
  agenda: "Agenda",
  profil: "Profil",
  pengaturan: "Pengaturan",
  akses: "Manajemen Akses",
};

function buildCrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const isId = /^[0-9a-f-]{8,}$/i.test(seg);
    const label = isId ? "Detail" : (SEGMENT_LABELS[seg] ?? seg);
    return { href, label, isLast: i === segments.length - 1 };
  });
}

interface AppHeaderProps {
  userRole?: string;
  userName?: string;
}

import { useAuthStore } from "@/store/auth-store";

export function AppHeader({
  userRole: propUserRole,
  userName: propUserName,
}: AppHeaderProps) {
  const storeRole = useAuthStore((s) => s.userRole);
  const storeName = useAuthStore((s) => s.userName);
  const userRole = propUserRole || storeRole || "admin";
  const userName = propUserName || storeName || "Azzam Azhari";
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, theme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const toggleSidebar = useSidebarStore((s) => s.toggle);
  const isSidebarCollapsed = useSidebarStore((s) => s.isCollapsed);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  const crumbs = buildCrumbs(pathname);
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const toggleMobile = useSidebarStore((s) => s.toggleMobile);

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border/60 bg-background/80 px-3 sm:px-4 backdrop-blur-md transition-colors duration-200">
      {/* ── Sisi Kiri: Toggle Sidebar + Breadcrumb ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        {/* Mobile Hamburger Drawer Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobile}
          className="lg:hidden h-8 w-8 text-foreground hover:bg-accent shrink-0 rounded-lg"
          title="Buka Menu Navigasi"
        >
          <PanelLeft className="h-4 w-4" />
          <span className="sr-only">Buka menu drawer</span>
        </Button>

        {/* Desktop Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden lg:flex h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
          title={isSidebarCollapsed ? "Buka Sidebar (Expanded)" : "Tutup Sidebar (Collapsed)"}
        >
          <PanelLeft className={cn("h-4 w-4 transition-transform duration-200", isSidebarCollapsed && "rotate-180")} />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {crumbs.filter((c) => c.href !== "/dashboard").map((crumb) => (
              <React.Fragment key={crumb.href}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {crumb.isLast ? (
                    <BreadcrumbPage className="font-medium text-foreground truncate max-w-[150px] sm:max-w-xs">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href} className="text-muted-foreground hover:text-foreground">
                        {crumb.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="sm:hidden font-semibold text-xs sm:text-sm truncate max-w-[180px]">
          {crumbs[crumbs.length - 1]?.label ?? "Dashboard"}
        </div>
      </div>

      {/* ── Sisi Kanan: Role Badge & Profile Dropdown ── */}
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn(
          "hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md",
          "bg-primary/10 text-primary border border-primary/20"
        )}>
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          {userRole}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                "bg-gradient-to-br from-primary to-emerald-400",
                "text-primary-foreground font-bold text-xs",
                "shadow-[0_0_12px_rgba(16,185,129,0.25)]",
                "hover:shadow-[0_0_18px_rgba(16,185,129,0.4)]",
                "transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40"
              )}
            >
              {initials}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52 mt-1">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-0.5">
                <span className="text-sm font-semibold">{userName}</span>
                <span className="text-xs text-muted-foreground capitalize">{userRole}</span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Profil */}
            <DropdownMenuItem asChild>
              <Link href="/profil" className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Profil Saya</span>
              </Link>
            </DropdownMenuItem>

            {/* Pengaturan Khusus Admin */}
            {userRole === "admin" && (
              <DropdownMenuItem asChild>
                <Link href="/pengaturan" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Pengaturan Sistem</span>
                </Link>
              </DropdownMenuItem>
            )}

            {/* Ganti Tema */}
            <DropdownMenuItem
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex items-center gap-2 cursor-pointer"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Moon className="h-4 w-4 text-muted-foreground" />
              )}
              <span>{isDark ? "Mode Terang" : "Mode Gelap"}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem
              onClick={() => router.push("/login")}
              className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
