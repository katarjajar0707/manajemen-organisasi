import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Calendar,
  Megaphone,
  MessagesSquare,
  ArrowRight,
  MessageCircle,
  User,
  Clock,
  MapPin,
  Building2,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { LogoutButton } from "@/components/common/logout-button";
import { DashboardAnnouncementBanner } from "@/components/dashboard/dashboard-announcement-banner";
import { PengumumanItem } from "@/actions/pengumuman";
import { DiskusiItem } from "@/actions/diskusi";
import { PublicTransparencyData } from "@/actions/transparansi";
import type { PengaturanSistemData } from "@/actions/pengaturan";
import { Profile } from "@/types/database";

interface AnggotaDashboardProps {
  profile: Profile;
  summaryData: PublicTransparencyData;
  announcements: PengumumanItem[];
  diskusis: DiskusiItem[];
  settings?: PengaturanSistemData;
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function AnggotaDashboard({
  profile,
  summaryData,
  announcements,
  diskusis,
  settings,
}: AnggotaDashboardProps) {
  const latestDiskusis = diskusis.slice(0, 4);
  const kegiatanMendatang = summaryData.kegiatan.jadwalMendatang.slice(0, 4);
  const orgName = settings?.profil.nama || "Karang Taruna";
  const orgWilayah = [settings?.profil.unitWilayah, settings?.profil.kelurahan].filter(Boolean).join(" · ");

  return (
    <div className="space-y-6">
      {/* ── Header / Greeting ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm shrink-0">
            {profile.foto_url ? (
               <AvatarImage src={profile.foto_url} alt={profile.nama} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {getInitials(profile.nama)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {getGreeting()}, selamat datang di {orgName} {orgWilayah ? `(${orgWilayah})` : ""}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {profile.nama}!
              </h1>
              <Badge variant="outline" className="text-xs px-2 py-0.5 border-primary/30 text-primary">
                Anggota
              </Badge>
              {settings?.operasional.periodeAktif && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5 text-muted-foreground">
                  Periode {settings.operasional.periodeAktif}
                </Badge>
              )}
            </div>
            {profile.bagian && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Building2 className="h-3 w-3" />
                {profile.bagian.nama}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link href="/diskusi" className="flex-1 sm:flex-initial">
            <Button size="sm" variant="outline" className="gap-2 w-full">
              <MessagesSquare className="h-4 w-4" />
              <span>Diskusi</span>
            </Button>
          </Link>
          <Link href="/kegiatan" className="flex-1 sm:flex-initial">
            <Button size="sm" className="gap-2 w-full">
              <Calendar className="h-4 w-4" />
              <span>Kegiatan</span>
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
          Informasi Organisasi
        </p>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          <Link href="/anggota" className="block">
            <Card className="hover:border-indigo-500/40 transition-all duration-200 hover:shadow-md h-full">
              <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                <div className="rounded-xl bg-indigo-100 dark:bg-indigo-900/30 p-3 shrink-0">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{summaryData.anggota.totalAktif}</div>
                  <p className="text-xs text-muted-foreground">
                    Anggota aktif dari {summaryData.anggota.totalSemua} terdaftar
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/kegiatan" className="block">
            <Card className="hover:border-orange-500/40 transition-all duration-200 hover:shadow-md h-full">
              <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                <div className="rounded-xl bg-orange-100 dark:bg-orange-900/30 p-3 shrink-0">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{summaryData.kegiatan.totalProgram}</div>
                  <p className="text-xs text-muted-foreground">
                    Total program, {summaryData.kegiatan.kegiatanTerlaksana} telah terlaksana
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/pengumuman" className="block">
            <Card className="hover:border-amber-500/40 transition-all duration-200 hover:shadow-md h-full">
              <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                <div className="rounded-xl bg-amber-100 dark:bg-amber-900/30 p-3 shrink-0">
                  <Megaphone className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{announcements.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {announcements.length > 0 ? "Pengumuman aktif untukmu" : "Belum ada pengumuman"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* ── Grid: Profil + Kegiatan ── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Info Profil Saya */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-primary" />
              Profil Saya
            </CardTitle>
            <CardDescription className="text-xs">
              Informasi akun dan posisi kamu di organisasi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar + Name */}
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 border-2 border-primary/20">
                {profile.foto_url ? (
                  <AvatarImage src={profile.foto_url} alt={profile.nama} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {getInitials(profile.nama)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{profile.nama}</p>
                <p className="text-xs text-muted-foreground">@{profile.username}</p>
                <Badge className="mt-1 text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                  Anggota
                </Badge>
              </div>
            </div>

            {/* Detail */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground text-xs">Divisi / Bagian</span>
                <span className="font-medium text-xs text-right">
                  {profile.bagian?.nama || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground text-xs">Username</span>
                <span className="font-mono text-xs">@{profile.username}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground text-xs">Bergabung</span>
                <span className="text-xs">
                  {new Date(profile.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {profile.bio && (
              <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3 py-1">
                &ldquo;{profile.bio}&rdquo;
              </p>
            )}

            {settings?.profil.alamat && (
              <div className="pt-2.5 border-t text-[11px] text-muted-foreground space-y-1">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-primary shrink-0" /> Sekretariat:
                </span>
                <p className="truncate">{settings.profil.alamat}</p>
                {settings.profil.telepon && (
                  <p>Kontak: {settings.profil.telepon}</p>
                )}
              </div>
            )}

            <Link href="/profil" className="block">
              <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                <User className="h-3.5 w-3.5" />
                Edit Profil Saya
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Jadwal Kegiatan */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-orange-500" />
                Jadwal Kegiatan
              </CardTitle>
              <CardDescription className="text-xs">
                Kegiatan terbaru yang direncanakan organisasi
              </CardDescription>
            </div>
            <Link href="/kegiatan">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Semua <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {kegiatanMendatang.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Belum ada jadwal kegiatan mendatang.</p>
              </div>
            ) : (
              kegiatanMendatang.map((k) => (
                <Link key={k.id} href="/kegiatan" className="block group">
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/40 transition-colors">
                    <div className="rounded-md bg-orange-100 dark:bg-orange-900/30 p-2 shrink-0 mt-0.5">
                      <Calendar className="h-3.5 w-3.5 text-orange-600" />
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
                    <Badge
                      variant="outline"
                      className="text-[10px] shrink-0 text-orange-600 border-orange-300"
                    >
                      {k.bagian}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
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
              Ikut berpartisipasi dalam diskusi organisasi
            </CardDescription>
          </div>
          <Link href="/diskusi">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              Lihat Semua <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {latestDiskusis.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <MessagesSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">Belum ada diskusi atau catatan umum.</p>
              <Link href="/diskusi" className="mt-3 inline-block">
                <Button size="sm" variant="outline" className="gap-2 text-xs">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Mulai Diskusi
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                {latestDiskusis.map((disc) => (
                  <Link key={disc.id} href={`/diskusi/${disc.id}`} className="block group">
                    <div className="p-3 rounded-lg border bg-card hover:bg-muted/40 transition-colors space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          {disc.judul}
                        </h4>
                        {disc.mentions && disc.mentions.length > 0 && (
                          <Badge
                            variant="outline"
                            className="text-primary text-[10px] shrink-0"
                          >
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
              <Link href="/diskusi" className="block pt-1">
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                  <MessagesSquare className="h-3.5 w-3.5" />
                  Buka Papan Diskusi
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
