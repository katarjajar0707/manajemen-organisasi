import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Wallet,
  Users,
  Calendar,
  Megaphone,
  MessagesSquare,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  MessageCircle,
} from "lucide-react";
import { LogoutButton } from "@/components/common/logout-button";
import { getDiskusis } from "@/actions/diskusi";
import { getPengumumanList } from "@/actions/pengumuman";
import { getPublicTransparencyData } from "@/actions/transparansi";
import { getProfile } from "@/lib/supabase/server";
import { DashboardAnnouncementBanner } from "@/components/dashboard/dashboard-announcement-banner";

export const dynamic = "force-dynamic";

function formatRupiah(amount: number): string {
  const rounded = Math.round(Number(amount) || 0);
  return `Rp ${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export default async function DashboardPage() {
  const [diskusis, announcements, summaryData, profile] = await Promise.all([
    getDiskusis(),
    getPengumumanList(),
    getPublicTransparencyData(),
    getProfile(),
  ]);

  const latestDiskusis = diskusis.slice(0, 4);

  const formatRelativeTime = (dateIso: string) => {
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
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Internal</h1>
          <p className="text-sm text-muted-foreground">
            Selamat datang di sistem manajemen dan koordinasi Karang Taruna.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link href="/diskusi" className="flex-1 sm:flex-initial">
            <Button size="sm" variant="outline" className="gap-2 w-full">
              <MessagesSquare className="h-4 w-4" />
              <span>Catatan Umum</span>
            </Button>
          </Link>
          <Link href="/kegiatan" className="flex-1 sm:flex-initial">
            <Button size="sm" className="gap-2 w-full">
              <PlusCircle className="h-4 w-4" />
              <span>Tambah Kegiatan</span>
            </Button>
          </Link>
          <LogoutButton variant="outline" size="sm" className="flex-1 sm:flex-initial" />
        </div>
      </div>

      {/* Pengumuman Banner untuk User / Role yang Ditentukan */}
      <DashboardAnnouncementBanner
        announcements={announcements}
        userRole={profile?.role}
        userBagianNama={profile?.bagian?.nama}
      />

      {/* Quick Summary Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Link href="/bagian/bendahara" className="block">
          <Card className="hover:border-primary/40 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3.5 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                Kas Bendahara
              </CardTitle>
              <Wallet className="h-4 w-4 text-primary shrink-0" />
            </CardHeader>
            <CardContent className="p-3.5 pt-0 sm:p-6 sm:pt-0">
              <div className="text-lg sm:text-2xl font-bold truncate">
                {formatRupiah(summaryData.keuangan.saldoAkhir)}
              </div>
              <div className="flex items-center text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 mt-1 gap-1">
                <TrendingUp className="h-3 w-3 shrink-0" />
                <span className="truncate">Saldo kas aktif</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/anggota" className="block">
          <Card className="hover:border-emerald-500/40 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3.5 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                Anggota Aktif
              </CardTitle>
              <Users className="h-4 w-4 text-emerald-600 shrink-0" />
            </CardHeader>
            <CardContent className="p-3.5 pt-0 sm:p-6 sm:pt-0">
              <div className="text-lg sm:text-2xl font-bold">
                {summaryData.anggota.totalAktif} Orang
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate">
                {summaryData.anggota.totalSemua} total terdaftar
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/kegiatan" className="block">
          <Card className="hover:border-indigo-500/40 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3.5 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                Agenda Kegiatan
              </CardTitle>
              <Calendar className="h-4 w-4 text-indigo-600 shrink-0" />
            </CardHeader>
            <CardContent className="p-3.5 pt-0 sm:p-6 sm:pt-0">
              <div className="text-lg sm:text-2xl font-bold">
                {summaryData.kegiatan.totalProgram} Program
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate">
                {summaryData.kegiatan.kegiatanTerlaksana} telah terlaksana
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pengumuman" className="block">
          <Card className="hover:border-amber-500/40 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3.5 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                Pengumuman
              </CardTitle>
              <Megaphone className="h-4 w-4 text-amber-600 shrink-0" />
            </CardHeader>
            <CardContent className="p-3.5 pt-0 sm:p-6 sm:pt-0">
              <div className="text-lg sm:text-2xl font-bold">{announcements.length} Info</div>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate">
                {announcements.length > 0 ? "Lihat broadcast terbaru" : "Belum ada pengumuman"}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Grid Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Akses Cepat Bagian</CardTitle>
              <CardDescription>Pilih bagian untuk melihat catatan internal</CardDescription>
            </div>
            <Link href="/bagian">
              <Button variant="ghost" size="sm" className="gap-1">
                <span>Semua</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              { name: "Bendahara", slug: "bendahara", desc: "Catatan keuangan kas masuk & keluar" },
              { name: "Sekretaris", slug: "sekretaris", desc: "Notula rapat & arsip persuratan" },
              { name: "Acara & Kegiatan", slug: "acara", desc: "Perencanaan & rundown kegiatan" },
              { name: "Humas & Kominfo", slug: "kominfo", desc: "Publikasi media sosial & broadcast" },
            ].map((dept) => (
              <Link
                key={dept.slug}
                href={dept.slug === "bendahara" ? "/bagian/bendahara" : `/bagian/${dept.slug}`}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/40 transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-sm">{dept.name}</h4>
                  <p className="text-xs text-muted-foreground">{dept.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Diskusi & Catatan Umum Terbaru</CardTitle>
              <CardDescription>Papan komunikasi terbuka antar-bagian</CardDescription>
            </div>
            <Link href="/diskusi">
              <Button variant="ghost" size="sm" className="gap-1">
                <span>Lihat Semua</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestDiskusis.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                <MessagesSquare className="h-6 w-6 mx-auto mb-1.5 opacity-40" />
                <span>Belum ada diskusi atau catatan umum.</span>
              </div>
            ) : (
              latestDiskusis.map((disc) => (
                <Link key={disc.id} href={`/diskusi/${disc.id}`} className="block">
                  <div className="p-3 rounded-lg border bg-card hover:bg-muted/40 transition-colors space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-sm line-clamp-1 hover:text-primary transition-colors">
                        {disc.judul}
                      </h4>
                      {disc.mentions && disc.mentions.length > 0 && (
                        <Badge variant="outline" className="text-primary text-[10px] shrink-0">
                          @{disc.mentions[0].bagianNama}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Oleh {disc.authorName} • {formatRelativeTime(disc.createdAt)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <MessageCircle className="h-3 w-3" />
                        {disc.balasanCount}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
