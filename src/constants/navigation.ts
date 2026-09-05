import {
  LayoutDashboard,
  User,
  Users,
  Building2,
  FolderKanban,
  Calendar,
  Megaphone,
  MessagesSquare,
  Package,
  FileText,
  Archive,
  Wallet,
  ShieldCheck,
  Settings,
  KeyRound,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles?: ("admin" | "ketua" | "anggota")[];
  badge?: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Profil",
    href: "/profil",
    icon: User,
  },
  {
    title: "Catatan Keuangan",
    href: "/bagian/bendahara",
    icon: Wallet,
  },
  {
    title: "Anggota",
    href: "/anggota",
    icon: Users,
  },
  {
    title: "Struktur Organisasi",
    href: "/struktur",
    icon: FolderKanban,
  },
  {
    title: "Kegiatan",
    href: "/kegiatan",
    icon: Calendar,
    roles: ["admin", "ketua"],
  },
  {
    title: "Pengumuman",
    href: "/pengumuman",
    icon: Megaphone,
  },
  {
    title: "Papan Diskusi",
    href: "/diskusi",
    icon: MessagesSquare,
  },
  {
    title: "Inventaris",
    href: "/inventaris",
    icon: Package,
  },
  {
    title: "Surat",
    href: "/surat",
    icon: FileText,
  },
  {
    title: "Arsip Dokumen",
    href: "/arsip",
    icon: Archive,
  },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    title: "Kelola Bagian",
    href: "/bagian",
    icon: Building2,
    roles: ["admin"],
  },
  {
    title: "Manajemen Pengguna",
    href: "/pengguna",
    icon: ShieldCheck,
    roles: ["admin"],
  },
  {
    title: "Manajemen Akses",
    href: "/akses",
    icon: KeyRound,
    roles: ["admin"],
  },
  {
    title: "Pengaturan Sistem",
    href: "/pengaturan",
    icon: Settings,
    roles: ["admin"],
  },
];

export const BOTTOM_NAV_ITEMS = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Diskusi", href: "/diskusi", icon: MessagesSquare },
  { title: "Kegiatan", href: "/kegiatan", icon: Calendar },
  { title: "Profil", href: "/profil", icon: User },
];
