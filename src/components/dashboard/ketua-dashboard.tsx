import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Wallet,
  Users,
  Calendar,
  Megaphone,
  MessagesSquare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  MessageCircle,
  ShieldCheck,
  Clock,
  MapPin,
} from "lucide-react";
import { LogoutButton } from "@/components/common/logout-button";
import { DashboardAnnouncementBanner } from "@/components/dashboard/dashboard-announcement-banner";
import { PengumumanItem } from "@/actions/pengumuman";
import { DiskusiItem } from "@/actions/diskusi";
import { PublicTransparencyData } from "@/actions/transparansi";
import type { PengaturanSistemData } from "@/actions/pengaturan";
import { Profile } from "@/types/database";

interface KetuaDashboardProps {
  profile: Profile;
  summaryData: PublicTransparencyData;
  announcements: PengumumanItem[];
  diskusis: DiskusiItem[];
  settings?: PengaturanSistemData;
}


function formatRupiah(amount: number): string {
  const rounded = Math.round(Number(amount) || 0);
  return `Rp ${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

function formatRelativeTime(dateIso: string): string {
  try {
    const date = new Date(dateIso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMinutes < 1) return "Baru saja";
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  } catch {
    return "Baru saja";
  }
}

export function KetuaDashboard({
  profile,
  summaryData,
  announcements,
  diskusis,
  settings,
}: KetuaDashboardProps) {
  const latestDiskusis = diskusis.slice(0, 4);
  const kegiatanMendatang = summaryData.kegiatan.jadwalMendatang.slice(0, 5);
  const orgName = settings?.profil.nama || "Karang Taruna";
  const orgWilayah = [settings?.profil.unitWilayah, settings?.profil.kelurahan].filter(Boolean).join(" · ");

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">
              Selamat datang, {profile.nama.split(" ")[0]}! 👋
            </h1>
            <Badge className="bg-amber-500/90 text-white text-xs px-2 py-0.5 font-semibold">
              Ketua
            </Badge>
            {settings?.operasional.periodeAktif && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 border-amber-500/30 text-amber-600 dark:text-amber-400 font-medium">
                Periode {settings.operasional.periodeAktif}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Pantau dan koordinasikan seluruh kegiatan {orgName} {orgWilayah ? `(${orgWilayah})` : ""}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link href="/kegiatan" className="flex-1 sm:flex-initial">
            <Button size="sm" variant="outline" className="gap-2 w-full">
              <Calendar className="h-4 w-4" />
              <span>Lihat Kegiatan</span>
            </Button>
          </Link>
          <Link href="/pengumuman/buat" className="flex-1 sm:flex-initial">
            <Button size="sm" className="gap-2 w-full bg-amber-500 hover:bg-amber-600 text-white">
              <PlusCircle className="h-4 w-4" />
              <span>Buat Pengumuman</span>
            </Button>
          </Link>
          <LogoutButton variant="outline" size="sm" className="flex-1 sm:flex-initial" />
        </div>
      </div>

      {/* ── Pengumuman Banner ── */}
      <DashboardAnnouncementBanner
        announcements={announcements}
        userRole={profile.role}
        userBagianNama={profile.bagian?.nama}
      />

      {/* ── Stat Cards ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">
          Ringkasan Organisasi
        </p>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Link href="/keuangan" className="block">
            <Card className="hover:border-emerald-500/40 transition-all duration-200 hover:shadow-md h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-3.5 sm:p-5">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  Saldo Kas
                </CardTitle>
                <div className="rounded-md bg-emerald-100 dark:bg-emerald-900/30 p-1.5 shrink-0">
                  <Wallet className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3.5 pt-0 sm:p-5 sm:pt-0">
                <div className="text-base sm:text-xl font-bold truncate">
                  {formatRupiah(summaryData.keuangan.saldoAkhir)}
                </div>
                <div className="flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 gap-1">
                  <TrendingUp className="h-3 w-3 shrink-0" />
                  <span className="truncate">Saldo kas aktif</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/anggota" className="block">
            <Card className="hover:border-indigo-500/40 transition-all duration-200 hover:shadow-md h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-3.5 sm:p-5">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  Anggota Aktif
                </CardTitle>
                <div className="rounded-md bg-indigo-100 dark:bg-indigo-900/30 p-1.5 shrink-0">
                  <Users className="h-4 w-4 text-indigo-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3.5 pt-0 sm:p-5 sm:pt-0">
                <div className="text-xl sm:text-2xl font-bold">
                  {summaryData.anggota.totalAktif}
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate">
                  {summaryData.anggota.totalSemua} total terdaftar
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/kegiatan" className="block">
            <Card className="hover:border-orange-500/40 transition-all duration-200 hover:shadow-md h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-3.5 sm:p-5">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  Total Kegiatan
                </CardTitle>
                <div className="rounded-md bg-orange-100 dark:bg-orange-900/30 p-1.5 shrink-0">
                  <Calendar className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3.5 pt-0 sm:p-5 sm:pt-0">
                <div className="text-xl sm:text-2xl font-bold">
                  {summaryData.kegiatan.totalProgram}
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate">
                  {summaryData.kegiatan.kegiatanTerlaksana} terlaksana
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/pengumuman" className="block">
            <Card className="hover:border-amber-500/40 transition-all duration-200 hover:shadow-md h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-3.5 sm:p-5">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  Pengumuman
                </CardTitle>
                <div className="rounded-md bg-amber-100 dark:bg-amber-900/30 p-1.5 shrink-0">
                  <Megaphone className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3.5 pt-0 sm:p-5 sm:pt-0">
                <div className="text-xl sm:text-2xl font-bold">{announcements.length}</div>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate">
                  {announcements.length > 0 ? "Broadcast aktif" : "Belum ada pengumuman"}
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* ── Grid: Kegiatan + Bagian ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Jadwal Kegiatan Mendatang */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-orange-600" />
                Jadwal Kegiatan Terbaru
              </CardTitle>
              <CardDescription className="text-xs">
                Kegiatan terbaru yang direncanakan
              </CardDescription>
            </div>
            <Link href="/kegiatan">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Kelola <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {kegiatanMendatang.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Belum ada jadwal kegiatan.</p>
              </div>
            ) : (
              kegiatanMendatang.map((k) => (
                <Link key={k.id} href="/kegiatan" className="block group">
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/40 transition-colors">
                    <div className="rounded-md bg-orange-100 dark:bg-orange-900/30 p-1.5 shrink-0 mt-0.5">
                      <Calendar className="h-3 w-3 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {k.judul}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                        {k.tanggal}
                      </p>
                      {k.lokasi && (
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <MapPin className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">{k.lokasi}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0 text-orange-600 border-orange-300">
                      {k.bagian}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
            <Link href="/kegiatan" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                <PlusCircle className="h-3.5 w-3.5" />
                Tambah Kegiatan Baru
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Akses Cepat Bagian + Pengguna */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-sky-600" />
                  Catatan Internal
                </CardTitle>
                <CardDescription className="text-xs">Notula dan koordinasi untuk bagian Anda</CardDescription>
              </div>
              <Link href="/catatan">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Buka <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <Link href="/catatan" className="block">
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                  Buka Catatan Bagian <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Manajemen Pengguna Shortcut */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-violet-600" />
                Direktori & Profil Akun
              </CardTitle>
              <CardDescription className="text-xs">
                Edit profil pribadi dan pantau direktori anggota organisasi
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-2">
              <Link href="/profil" className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                  <Users className="h-3.5 w-3.5" />
                  Profil & Direktori Pengguna
                </Button>
              </Link>
              <Link href="/anggota" className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                  <Users className="h-3.5 w-3.5" />
                  Daftar Anggota
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Diskusi Terbaru ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessagesSquare className="h-4 w-4 text-sky-600" />
              Diskusi & Catatan Umum Terbaru
            </CardTitle>
            <CardDescription className="text-xs">
              Papan komunikasi terbuka antar-bagian
            </CardDescription>
          </div>
          <Link href="/diskusi">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              Lihat Semua <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {latestDiskusis.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <MessagesSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">Belum ada diskusi atau catatan umum.</p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {latestDiskusis.map((disc) => (
                <Link key={disc.id} href={`/diskusi/${disc.id}`} className="block group">
                  <div className="p-3 rounded-lg border bg-card hover:bg-muted/40 transition-colors space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {disc.judul}
                      </h4>
                      {disc.mentions && disc.mentions.length > 0 && (
                        <Badge variant="outline" className="text-primary text-[10px] shrink-0">
                          @{disc.mentions[0].bagianNama}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {formatRelativeTime(disc.createdAt)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <MessageCircle className="h-3 w-3" />
                        {disc.balasanCount}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
