import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Calendar, Megaphone, MessagesSquare, ArrowRight, MessageCircle, User, Clock, MapPin, Building2, Sparkles } from 'lucide-react';
import { LogoutButton } from '@/components/common/logout-button';
import { DashboardAnnouncementBanner } from '@/components/dashboard/dashboard-announcement-banner';
import { PengumumanItem } from '@/actions/pengumuman';
import { DiskusiItem } from '@/actions/diskusi';
import { PublicTransparencyData } from '@/actions/transparansi';
import type { PengaturanSistemData } from '@/actions/pengaturan';
import { Profile } from '@/types/database';

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
    if (diffMinutes < 1) return 'Baru saja';
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  } catch {
    return 'Baru saja';
  }
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function AnggotaDashboard({ profile, summaryData, announcements, diskusis, settings }: AnggotaDashboardProps) {
  const latestDiskusis = diskusis.slice(0, 4);
  const kegiatanMendatang = summaryData.kegiatan.jadwalMendatang.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* ── Header / Greeting ── */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/10 via-card to-card p-4 shadow-sm sm:p-6">
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar className="h-14 w-14 shrink-0 border-2 border-background shadow-md sm:h-16 sm:w-16">
              {profile.foto_url ? <AvatarImage src={profile.foto_url} alt={profile.nama} /> : null}
              <AvatarFallback className="bg-primary/15 text-primary text-base font-bold sm:text-lg">{getInitials(profile.nama)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-medium text-primary sm:text-sm">{getGreeting()}, selamat datang kembali</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{profile.nama}</h1>
                <Badge variant="outline" className="border-primary/30 bg-background/50 px-2 py-0.5 text-xs text-primary">
                  Anggota
                </Badge>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">{profile.bagian?.nama || 'Anggota organisasi'}</span>
                {settings?.operasional.periodeAktif && <span className="hidden sm:inline">· Periode {settings.operasional.periodeAktif}</span>}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center">
            <Link href="/diskusi" className="min-w-0">
              <Button size="sm" variant="outline" className="w-full gap-1.5 bg-background/60 px-2 text-xs sm:w-auto sm:gap-2 sm:px-3">
                <MessagesSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Diskusi</span>
              </Button>
            </Link>
            <Link href="/kegiatan" className="min-w-0">
              <Button size="sm" className="w-full gap-1.5 px-2 text-xs sm:w-auto sm:gap-2 sm:px-3">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Kegiatan</span>
              </Button>
            </Link>
            <LogoutButton variant="outline" size="sm" className="w-full px-2 text-xs sm:w-auto sm:px-3" />
          </div>
        </div>
      </div>

      {/* ── Pengumuman Banner ── */}
      <DashboardAnnouncementBanner announcements={announcements} userRole={profile.role} userBagianNama={profile.bagian?.nama} />

      {/* ── Stat Cards ── */}
      <div>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">Ringkasan organisasi</p>
            <p className="mt-1 text-sm text-muted-foreground">Pantau informasi yang paling relevan untukmu.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          <Link href="/anggota" className="block">
            <Card className="h-full border-border/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                <div className="shrink-0 rounded-xl bg-primary/10 p-3 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight">{summaryData.anggota.totalAktif}</div>
                  <p className="text-xs text-muted-foreground">Anggota aktif dari {summaryData.anggota.totalSemua} terdaftar</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/kegiatan" className="block">
            <Card className="h-full border-border/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                <div className="shrink-0 rounded-xl bg-primary/10 p-3 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight">{summaryData.kegiatan.totalProgram}</div>
                  <p className="text-xs text-muted-foreground">Total program, {summaryData.kegiatan.kegiatanTerlaksana} telah terlaksana</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/pengumuman" className="block">
            <Card className="h-full border-border/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                <div className="shrink-0 rounded-xl bg-primary/10 p-3 text-primary">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight">{announcements.length}</div>
                  <p className="text-xs text-muted-foreground">{announcements.length > 0 ? 'Pengumuman aktif untukmu' : 'Belum ada pengumuman'}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* ── Grid: Profil + Kegiatan ── */}
      <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
        {/* Info Profil Saya */}
        <Card className="border-border/70 shadow-sm lg:col-span-2">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </span>
              Profil Saya
            </CardTitle>
            <CardDescription className="pl-10 text-xs">Informasi akun dan posisi kamu di organisasi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            {/* Avatar + Name */}
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-sm">
                {profile.foto_url ? <AvatarImage src={profile.foto_url} alt={profile.nama} /> : null}
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">{getInitials(profile.nama)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{profile.nama}</p>
                <p className="text-xs text-muted-foreground">@{profile.username}</p>
                <Badge className="mt-1 text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">Anggota</Badge>
              </div>
            </div>

            {/* Detail */}
            <div className="space-y-0 rounded-xl border border-border/60 bg-muted/20 px-3">
              <div className="flex items-center justify-between gap-3 border-b border-border/50 py-2.5">
                <span className="text-muted-foreground text-xs">Divisi / Bagian</span>
                <span className="font-medium text-xs text-right">{profile.bagian?.nama || '—'}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border/50 py-2.5">
                <span className="text-muted-foreground text-xs">Username</span>
                <span className="font-mono text-xs">@{profile.username}</span>
              </div>
              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-muted-foreground text-xs">Bergabung</span>
                <span className="text-xs">
                  {new Date(profile.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {profile.bio && <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3 py-1">&ldquo;{profile.bio}&rdquo;</p>}

            {settings?.profil.alamat && (
              <div className="space-y-1 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-primary shrink-0" /> Sekretariat:
                </span>
                <p className="truncate">{settings.profil.alamat}</p>
                {settings.profil.telepon && <p>Kontak: {settings.profil.telepon}</p>}
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
        <Card className="border-border/70 shadow-sm lg:col-span-3">
          <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/60 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </span>
                Jadwal Kegiatan
              </CardTitle>
              <CardDescription className="pl-10 text-xs">Kegiatan terbaru yang direncanakan organisasi</CardDescription>
            </div>
            <Link href="/kegiatan">
              <Button variant="ghost" size="sm" className="shrink-0 gap-1 text-xs text-primary hover:text-primary">
                Semua <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-5">
            {kegiatanMendatang.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 py-10 text-center text-muted-foreground">
                <Calendar className="mx-auto mb-2 h-8 w-8 opacity-40" />
                <p className="text-sm font-medium text-foreground">Belum ada jadwal mendatang</p>
                <p className="mt-1 text-xs">Agenda baru akan tampil di sini setelah dipublikasikan.</p>
              </div>
            ) : (
              kegiatanMendatang.map((k) => (
                <Link key={k.id} href="/kegiatan" className="block group">
                  <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/60 p-3 transition-all hover:border-primary/30 hover:bg-primary/3">
                    <div className="mt-0.5 shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
                      <Calendar className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">{k.judul}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{k.tanggal}</p>
                      {k.lokasi && (
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <MapPin className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">{k.lokasi}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0 border-primary/25 bg-primary/5 text-[10px] text-primary">
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
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessagesSquare className="h-4 w-4" />
              </span>
              Diskusi & Catatan Umum Terbaru
            </CardTitle>
            <CardDescription className="pl-10 text-xs">Ikut berpartisipasi dalam diskusi organisasi</CardDescription>
          </div>
          <Link href="/diskusi">
            <Button variant="ghost" size="sm" className="shrink-0 gap-1 text-xs text-primary hover:text-primary">
              Lihat Semua <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3 pt-5">
          {latestDiskusis.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 py-10 text-center text-muted-foreground">
              <MessagesSquare className="mx-auto mb-2 h-8 w-8 opacity-40" />
              <p className="text-sm font-medium text-foreground">Belum ada diskusi terbaru</p>
              <p className="mt-1 text-xs">Mulai percakapan untuk terhubung dengan organisasi.</p>
              <Link href="/diskusi" className="mt-4 inline-block">
                <Button size="sm" variant="outline" className="gap-2 text-xs">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Mulai Diskusi
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {latestDiskusis.map((disc) => (
                  <Link key={disc.id} href={`/diskusi/${disc.id}`} className="block group">
                    <div className="space-y-2 rounded-xl border border-border/60 bg-card/60 p-3.5 transition-all hover:border-primary/30 hover:bg-primary/3">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">{disc.judul}</h4>
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
              <Link href="/diskusi" className="block pt-1">
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs hover:border-primary/40 hover:text-primary">
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
