"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  LayoutDashboard,
  Wallet,
  Users,
  FolderKanban,
  Calendar,
  Megaphone,
  MessagesSquare,
  Package,
  FileText,
  Archive,
  User,
  ShieldCheck,
  KeyRound,
  Settings,
  ArrowRight,
} from "lucide-react";

interface SearchItem {
  title: string;
  category: "Modul Utama" | "Administrasi" | "Pengaturan";
  href: string;
  description: string;
  icon: any;
  keywords: string;
}

const SEARCH_ITEMS: SearchItem[] = [
  {
    title: "Dashboard Internal",
    category: "Modul Utama",
    href: "/dashboard",
    description: "Ringkasan metrik kas, anggota aktif, dan diskusi terbaru",
    icon: LayoutDashboard,
    keywords: "dashboard ringkasan beranda home statistik",
  },
  {
    title: "Catatan Keuangan & Kas",
    category: "Modul Utama",
    href: "/keuangan",
    description: "Pemasukan, pengeluaran, saldo kas, dan nota lampiran",
    icon: Wallet,
    keywords: "keuangan kas masuk keluar bendahara saldo duit uang nota",
  },
  {
    title: "Catatan Bagian",
    category: "Modul Utama",
    href: "/catatan",
    description: "Notula dan koordinasi internal untuk bagian Anda",
    icon: FileText,
    keywords: "catatan bagian notula koordinasi internal divisi",
  },
  {
    title: "Data Anggota",
    category: "Modul Utama",
    href: "/anggota",
    description: "Daftar pengurus, warga pemuda, RT/RW, dan status keanggotaan",
    icon: Users,
    keywords: "anggota pemuda warga pengurus kontak jabatan rt rw",
  },
  {
    title: "Struktur Organisasi",
    category: "Modul Utama",
    href: "/struktur",
    description: "Bagan kepengurusan multi-agenda dan periode aktif",
    icon: FolderKanban,
    keywords: "struktur bagan agenda kepengurusan periode panitia",
  },
  {
    title: "Kalender & Jadwal Kegiatan",
    category: "Modul Utama",
    href: "/kegiatan",
    description: "Jadwal acara, kerja bakti, turnamen, dan galeri dokumentasi",
    icon: Calendar,
    keywords: "kegiatan acara kalender agenda dokumentasi foto jadwal",
  },
  {
    title: "Pengumuman & Broadcast",
    category: "Modul Utama",
    href: "/pengumuman",
    description: "Pemberitahuan resmi internal satu arah untuk pengurus",
    icon: Megaphone,
    keywords: "pengumuman broadcast info kabar berita",
  },
  {
    title: "Papan Diskusi & Catatan Umum",
    category: "Modul Utama",
    href: "/diskusi",
    description: "Ruang koordinasi terbuka lintas divisi & mention departemen",
    icon: MessagesSquare,
    keywords: "diskusi catatan umum forum obrolan mention",
  },
  {
    title: "Inventaris & Peminjaman Aset",
    category: "Administrasi",
    href: "/inventaris",
    description: "Data aset barang, kondisi fisik, dan sirkulasi pinjam pakai",
    icon: Package,
    keywords: "inventaris barang aset alat sound tenda meja kursi pinjam",
  },
  {
    title: "Template Surat Resmi",
    category: "Administrasi",
    href: "/surat",
    description: "Format baku surat undangan, izin, proposal, dan generator otomatis",
    icon: FileText,
    keywords: "surat template generator undangan izin proposal keterangan",
  },
  {
    title: "Arsip Dokumen",
    category: "Administrasi",
    href: "/arsip",
    description: "Repositori digital SK kepengurusan, LPJ, proposal, dan notulensi",
    icon: Archive,
    keywords: "arsip dokumen sk lpj proposal notulensi pdf file berkas",
  },
  {
    title: "Profil Saya",
    category: "Modul Utama",
    href: "/profil",
    description: "Edit profil akun: nama lengkap, username, nomor WhatsApp, kata sandi, dan foto",
    icon: User,
    keywords: "profil akun setting biodata foto avatar password kata sandi wa whatsapp nomor nama",
  },
  {
    title: "Manajemen Pengguna",
    category: "Pengaturan",
    href: "/pengguna",
    description: "Kelola akun login dan hak akses role admin",
    icon: ShieldCheck,
    keywords: "pengguna user akun role admin ketua",
  },
  {
    title: "Manajemen Akses & RLS",
    category: "Pengaturan",
    href: "/akses",
    description: "Hak otorisasi dan matriks perizinan bagian",
    icon: KeyRound,
    keywords: "akses izin rls matrix security",
  },
  {
    title: "Pengaturan Sistem",
    category: "Pengaturan",
    href: "/pengaturan",
    description: "Konfigurasi umum organisasi dan profil sekretariat",
    icon: Settings,
    keywords: "pengaturan sistem konfigurasi logo nama organisasi",
  },
];

export function GlobalSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const results = useMemo(() => {
    if (!query.trim()) return SEARCH_ITEMS;
    const q = query.toLowerCase();
    return SEARCH_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSelect = (href: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden shadow-2xl border-border/80">
        <DialogHeader className="p-3 border-b border-border/60">
          <div className="flex items-center gap-2.5 px-1">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik nama modul, fitur, atau kata kunci..."
              className="border-0 shadow-none focus-visible:ring-0 text-sm h-8 px-0"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded"
              >
                Reset
              </button>
            )}
          </div>
        </DialogHeader>

        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1 divide-y divide-border/20">
          {results.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground">
              Tidak ada modul yang cocok dengan pencarian "{query}".
            </div>
          ) : (
            results.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.href}
                  onClick={() => handleSelect(item.href)}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-foreground">
                          {item.title}
                        </span>
                        <Badge variant="outline" className="text-[10px] py-0 hidden sm:inline-flex">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </div>
              );
            })
          )}
        </div>

        <div className="p-2.5 px-3.5 bg-muted/30 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>Tekan <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[10px]">ESC</kbd> untuk menutup</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[10px]">Ctrl + K</kbd> untuk shortcut pencarian</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
