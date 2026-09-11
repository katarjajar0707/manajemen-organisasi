import Link from 'next/link';
import { Suspense, type ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Wallet, Users, Calendar, Megaphone, MessagesSquare, ArrowRight, TrendingUp, TrendingDown, PlusCircle, MessageCircle, ShieldCheck, Settings, Building2, KeyRound, Activity, BarChart3, UserCheck, Clock, Sparkles } from 'lucide-react';
import { LogoutButton } from '@/components/common/logout-button';
import { DashboardAnnouncementBanner } from '@/components/dashboard/dashboard-announcement-banner';
import { PublicTransparencyData } from '@/actions/transparansi';
import type { PengaturanSistemData } from '@/actions/pengaturan';
import { Profile } from '@/types/database';
import { getDiskusis, DiskusiItem } from '@/actions/diskusi';
import { getPengumumanList, PengumumanItem } from '@/actions/pengumuman';
import { getUsers } from '@/actions/admin-users';
import { getBagianList } from '@/actions/bagian';
import { getCachedPengaturanSistem } from '@/lib/cache/pengaturan';
import { getCachedPublicTransparencyData } from '@/lib/cache/transparansi';

interface AdminDashboardProps {
  profile: Profile;
  summaryData: PublicTransparencyData;
  announcements: PengumumanItem[];
  diskusis: DiskusiItem[];
  totalUsers: number;
  totalBagian: number;
  settings?: PengaturanSistemData;
}

function formatRupiah(amount: number): string {
  const rounded = Math.round(Number(amount) || 0);
  return `Rp ${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
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

const ADMIN_QUICK_ACTIONS = [
  {
    title: 'Manajemen Pengguna',
    desc: 'Kelola akun & role seluruh pengurus',
    href: '/pengguna',
    icon: ShieldCheck,
    color: 'text-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    border: 'border-violet-200/60 dark:border-violet-800/40 hover:border-violet-400/60',
  },
  {
    title: 'Kelola Bagian',
    desc: 'Tambah & atur divisi/bagian organisasi',
    href: '/bagian',
    icon: Building2,
    color: 'text-sky-600',
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    border: 'border-sky-200/60 dark:border-sky-800/40 hover:border-sky-400/60',
  },
  {
    title: 'Manajemen Akses',
    desc: 'Konfigurasi izin & hak akses role',
    href: '/akses',
    icon: KeyRound,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200/60 dark:border-amber-800/40 hover:border-amber-400/60',
  },
  {
    title: 'Pengaturan Sistem',
    desc: 'Konfigurasi profil & sistem organisasi',
    href: '/pengaturan',
    icon: Settings,
    color: 'text-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-200/60 dark:border-rose-800/40 hover:border-rose-400/60',
  },
];

export function AdminDashboard({ profile, summaryData, announcements, diskusis, totalUsers, totalBagian, settings }: AdminDashboardProps) {
  const latestDiskusis = diskusis.slice(0, 4);
  const orgName = settings?.profil.nama || 'Karang Taruna';
  const orgWilayah = [settings?.profil.unitWilayah, settings?.profil.kelurahan].filter(Boolean).join(' · ');
  const saldoPersen = summaryData.keuangan.totalMasuk > 0 ? Math.round(((summaryData.keuangan.totalMasuk - summaryData.keuangan.totalKeluar) / summaryData.keuangan.totalMasuk) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">Selamat datang, {profile.nama.split(' ')[0]}! 👋</h1>
            <Badge className="bg-violet-600/90 text-white text-xs px-2 py-0.5 font-semibold">Administrator</Badge>
            {settings?.operasional.periodeAktif && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 border-violet-500/30 text-violet-600 dark:text-violet-400 font-medium">
                Periode {settings.operasional.periodeAktif}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Panel kendali sistem manajemen {orgName} {orgWilayah ? `(${orgWilayah})` : ''}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link href="/pengumuman/buat" className="flex-1 sm:flex-initial">
            <Button size="sm" variant="outline" className="gap-2 w-full">
              <Megaphone className="h-4 w-4" />
              <span>Buat Pengumuman</span>
            </Button>
          </Link>
          <Link href="/pengguna" className="flex-1 sm:flex-initial">
            <Button size="sm" className="gap-2 w-full bg-violet-600 hover:bg-violet-700 text-white">
              <UserCheck className="h-4 w-4" />
              <span>Manajemen Pengguna</span>
            </Button>
          </Link>
          <LogoutButton variant="outline" size="sm" className="flex-1 sm:flex-initial" />
        </div>
      </div>

      {/* ── Pengumuman Banner ── */}
      <DashboardAnnouncementBanner announcements={announcements} userRole={profile.role} userBagianNama={profile.bagian?.nama} />

      {/* ── Stat Cards ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Ringkasan Sistem</p>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* Pengguna */}
          <Link href="/pengguna" className="block xl:col-span-1">
            <Card className="hover:border-violet-500/40 transition-all duration-200 hover:shadow-md h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-3.5 sm:p-4">
                <CardTitle className="text-xs font-medium text-muted-foreground truncate">Total Pengguna</CardTitle>
                <div className="rounded-md bg-violet-100 dark:bg-violet-900/30 p-1 shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5 text-violet-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3.5 pt-0 sm:p-4 sm:pt-0">
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-[11px] text-muted-foreground mt-1">akun terdaftar</p>
              </CardContent>
            </Card>
          </Link>

          {/* Bagian */}
          <Link href="/bagian" className="block xl:col-span-1">
            <Card className="hover:border-sky-500/40 transition-all duration-200 hover:shadow-md h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-3.5 sm:p-4">
                <CardTitle className="text-xs font-medium text-muted-foreground truncate">Total Bagian</CardTitle>
                <div className="rounded-md bg-sky-100 dark:bg-sky-900/30 p-1 shrink-0">
                  <Building2 className="h-3.5 w-3.5 text-sky-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3.5 pt-0 sm:p-4 sm:pt-0">
                <div className="text-2xl font-bold">{totalBagian}</div>
                <p className="text-[11px] text-muted-foreground mt-1">divisi aktif</p>
              </CardContent>
            </Card>
          </Link>

          {/* Kas */}
          <Link href="/keuangan" className="block xl:col-span-1">
            <Card className="hover:border-emerald-500/40 transition-all duration-200 hover:shadow-md h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-3.5 sm:p-4">
                <CardTitle className="text-xs font-medium text-muted-foreground truncate">Saldo Kas</CardTitle>
                <div className="rounded-md bg-emerald-100 dark:bg-emerald-900/30 p-1 shrink-0">
                  <Wallet className="h-3.5 w-3.5 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3.5 pt-0 sm:p-4 sm:pt-0">
                <div className="text-base sm:text-lg font-bold truncate">{formatRupiah(summaryData.keuangan.saldoAkhir)}</div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                  <TrendingUp className="h-3 w-3 shrink-0" />
                  <span>{saldoPersen}% dari pemasukan</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Anggota */}
          <Link href="/anggota" className="block xl:col-span-1">
            <Card className="hover:border-indigo-500/40 transition-all duration-200 hover:shadow-md h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-3.5 sm:p-4">
                <CardTitle className="text-xs font-medium text-muted-foreground truncate">Anggota Aktif</CardTitle>
                <div className="rounded-md bg-indigo-100 dark:bg-indigo-900/30 p-1 shrink-0">
                  <Users className="h-3.5 w-3.5 text-indigo-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3.5 pt-0 sm:p-4 sm:pt-0">
                <div className="text-2xl font-bold">{summaryData.anggota.totalAktif}</div>
                <p className="text-[11px] text-muted-foreground mt-1">dari {summaryData.anggota.totalSemua} terdaftar</p>
              </CardContent>
            </Card>
          </Link>

          {/* Kegiatan */}
          <Link href="/kegiatan" className="block xl:col-span-1">
            <Card className="hover:border-orange-500/40 transition-all duration-200 hover:shadow-md h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-3.5 sm:p-4">
                <CardTitle className="text-xs font-medium text-muted-foreground truncate">Kegiatan</CardTitle>
                <div className="rounded-md bg-orange-100 dark:bg-orange-900/30 p-1 shrink-0">
                  <Calendar className="h-3.5 w-3.5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3.5 pt-0 sm:p-4 sm:pt-0">
                <div className="text-2xl font-bold">{summaryData.kegiatan.totalProgram}</div>
                <p className="text-[11px] text-muted-foreground mt-1">{summaryData.kegiatan.kegiatanTerlaksana} terlaksana</p>
              </CardContent>
            </Card>
          </Link>

          {/* Pengumuman */}
          <Link href="/pengumuman" className="block xl:col-span-1">
            <Card className="hover:border-amber-500/40 transition-all duration-200 hover:shadow-md h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-3.5 sm:p-4">
                <CardTitle className="text-xs font-medium text-muted-foreground truncate">Pengumuman</CardTitle>
                <div className="rounded-md bg-amber-100 dark:bg-amber-900/30 p-1 shrink-0">
                  <Megaphone className="h-3.5 w-3.5 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent className="p-3.5 pt-0 sm:p-4 sm:pt-0">
                <div className="text-2xl font-bold">{announcements.length}</div>
                <p className="text-[11px] text-muted-foreground mt-1">info aktif</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* ── Panel Manajemen Cepat ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Panel Manajemen</p>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {ADMIN_QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} className="block group">
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${action.border} ${action.bg} transition-all duration-200 group-hover:shadow-md`}>
                  <div className={`rounded-lg p-2 bg-white/70 dark:bg-black/20 shrink-0`}>
                    <Icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{action.title}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Identitas & Saluran Komunikasi Resmi Organisasi ── */}
      <Card className="border bg-gradient-to-r from-background via-muted/20 to-muted/40 shadow-xs">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base text-foreground">{orgName}</span>
                {settings?.profil.slogan && <span className="text-xs text-muted-foreground italic">&ldquo;{settings.profil.slogan}&rdquo;</span>}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>
                    {settings?.profil.alamat || 'Balai Warga'}{' '}
                    {[settings?.profil.unitWilayah, settings?.profil.kelurahan, settings?.profil.kota].filter(Boolean).length > 0
                      ? `(${[settings?.profil.unitWilayah, settings?.profil.kelurahan, settings?.profil.kota].filter(Boolean).join(', ')})`
                      : ''}
                  </span>
                </span>
                {settings?.profil.email && (
                  <span className="flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                    <span>{settings.profil.email}</span>
                  </span>
                )}
                {settings?.profil.telepon && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{settings.profil.telepon}</span>
                  </span>
                )}
                {settings?.profil.instagram && (
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                    <span>{settings.profil.instagram}</span>
                  </span>
                )}
              </div>
            </div>
            <Link href="/pengaturan" className="shrink-0">
              <Button variant="outline" size="sm" className="gap-2 text-xs h-8">
                <Settings className="h-3.5 w-3.5 text-violet-600" />
                <span>Ubah Pengaturan Sistem</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* ── Grid: Keuangan + Aktivitas ── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Ringkasan Keuangan */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                Ringkasan Keuangan
              </CardTitle>
              <CardDescription>Laporan kas organisasi keseluruhan</CardDescription>
            </div>
            <Link href="/keuangan">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Detail <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm text-muted-foreground">Total Masuk</span>
                </div>
                <span className="font-semibold text-sm text-emerald-600">{formatRupiah(summaryData.keuangan.totalMasuk)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="text-sm text-muted-foreground">Total Keluar</span>
                </div>
                <span className="font-semibold text-sm text-rose-600">{formatRupiah(summaryData.keuangan.totalKeluar)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <span className="text-sm font-semibold">Saldo Akhir</span>
                </div>
                <span className="font-bold text-sm text-primary">{formatRupiah(summaryData.keuangan.saldoAkhir)}</span>
              </div>
            </div>

            {/* Visual bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Efisiensi kas</span>
                <span>{saldoPersen}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500" style={{ width: `${Math.min(saldoPersen, 100)}%` }} />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Link href="/keuangan" className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                  Catat Masuk
                </Button>
              </Link>
              <Link href="/keuangan" className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                  <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                  Catat Keluar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Aktivitas Sistem Terkini */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-violet-600" />
                Aktivitas Sistem Terkini
              </CardTitle>
              <CardDescription>Diskusi & catatan umum terbaru</CardDescription>
            </div>
            <Link href="/diskusi">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Semua <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {latestDiskusis.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessagesSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Belum ada diskusi atau catatan umum.</p>
              </div>
            ) : (
              latestDiskusis.map((disc) => (
                <Link key={disc.id} href={`/diskusi/${disc.id}`} className="block group">
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/40 transition-colors">
                    <div className="rounded-full bg-violet-100 dark:bg-violet-900/30 p-1.5 shrink-0 mt-0.5">
                      <MessageCircle className="h-3 w-3 text-violet-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">{disc.judul}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground flex-wrap">
                        <span>{disc.authorName}</span>
                        <span>·</span>
                        <span>{disc.bagianPembuatNama}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {formatRelativeTime(disc.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                      <MessageCircle className="h-3 w-3" />
                      {disc.balasanCount}
                    </div>
                  </div>
                </Link>
              ))
            )}

            <div className="pt-1">
              <Link href="/diskusi">
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                  <MessagesSquare className="h-3.5 w-3.5" />
                  Buka Papan Diskusi
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Jadwal Kegiatan Mendatang ── */}
      {summaryData.kegiatan.jadwalMendatang.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-500" />
                Jadwal Kegiatan Terbaru
              </CardTitle>
              <CardDescription>Kegiatan terbaru yang direncanakan organisasi</CardDescription>
            </div>
            <Link href="/kegiatan">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Kelola <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {summaryData.kegiatan.jadwalMendatang.slice(0, 3).map((k) => (
                <Link key={k.id} href={`/kegiatan`} className="block group">
                  <div className="p-3 rounded-lg border bg-card hover:bg-muted/40 transition-colors space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">{k.judul}</p>
                      <Badge variant="outline" className="text-[10px] shrink-0 text-orange-600 border-orange-300">
                        {k.bagian}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span className="truncate">{k.tanggal}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function AdminDashboardShell({ profile, children = null }: { profile?: Profile; children?: ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{profile ? `Selamat datang, ${profile.nama.split(' ')[0]}! 👋` : 'Selamat datang! 👋'}</h1>
            <Badge className="bg-violet-600/90 text-white text-xs px-2 py-0.5 font-semibold">{profile?.role === 'admin' ? 'Administrator' : 'Portal Pengurus'}</Badge>
            <Suspense fallback={<span className="text-xs text-muted-foreground">Periode aktif</span>}>
              <AdminDashboardPeriod />
            </Suspense>
          </div>
          <p className="text-sm text-muted-foreground">Panel kendali sistem manajemen Karang Taruna.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link href="/pengumuman/buat" className="flex-1 sm:flex-initial">
            <Button size="sm" variant="outline" className="gap-2 w-full">
              <Megaphone className="h-4 w-4" />
              <span>Buat Pengumuman</span>
            </Button>
          </Link>
          <Link href="/pengguna" className="flex-1 sm:flex-initial">
            <Button size="sm" className="gap-2 w-full bg-violet-600 hover:bg-violet-700 text-white">
              <UserCheck className="h-4 w-4" />
              <span>Manajemen Pengguna</span>
            </Button>
          </Link>
          <LogoutButton variant="outline" size="sm" className="flex-1 sm:flex-initial" />
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Panel Manajemen</p>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {ADMIN_QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} className="block group">
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${action.border} ${action.bg} transition-all duration-200 group-hover:shadow-md`}>
                  <div className="rounded-lg p-2 bg-white/70 dark:bg-black/20 shrink-0">
                    <Icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{action.title}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}

export function DashboardSectionSkeleton({ variant, className = '' }: { variant: 'stats' | 'list' | 'organization' | 'card' | 'schedule'; className?: string }) {
  if (variant === 'stats') {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="h-28">
            <CardContent className="p-4 space-y-3">
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              <div className="h-6 w-20 animate-pulse rounded bg-muted" />
              <div className="h-2 w-28 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  if (variant === 'organization')
    return (
      <Card className={className}>
        <CardContent className="p-5 space-y-3">
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          <div className="h-3 w-72 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  if (variant === 'schedule')
    return (
      <Card className={className}>
        <CardHeader>
          <div className="h-5 w-56 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </CardContent>
      </Card>
    );
  return (
    <Card className={className}>
      <CardHeader>
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        <div className="h-3 w-64 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: variant === 'list' ? 3 : 4 }).map((_, index) => (
          <div key={index} className="h-12 animate-pulse rounded-lg bg-muted" />
        ))}
      </CardContent>
    </Card>
  );
}

export async function AdminDashboardPeriod() {
  const settings = await getCachedPengaturanSistem();
  return settings.operasional.periodeAktif ? (
    <Badge variant="outline" className="text-xs px-2 py-0.5 border-violet-500/30 text-violet-600 dark:text-violet-400 font-medium">
      Periode {settings.operasional.periodeAktif}
    </Badge>
  ) : null;
}

export async function AdminDashboardAnnouncements({ profile }: { profile: Profile }) {
  const announcements = await getPengumumanList();
  return <DashboardAnnouncementBanner announcements={announcements} userRole={profile.role} userBagianNama={profile.bagian?.nama} />;
}

export async function AdminDashboardStats() {
  const [summaryData, users, bagianList] = await Promise.all([getCachedPublicTransparencyData(), getUsers().catch(() => []), getBagianList().catch(() => [])]);
  const cards = [
    ['Total Pengguna', users.length, 'akun terdaftar', 'text-violet-600'],
    ['Total Bagian', bagianList.length, 'divisi aktif', 'text-sky-600'],
    ['Saldo Kas', formatRupiah(summaryData.keuangan.saldoAkhir), 'saldo akhir', 'text-emerald-600'],
    ['Anggota Aktif', summaryData.anggota.totalAktif, `dari ${summaryData.anggota.totalSemua} terdaftar`, 'text-indigo-600'],
    ['Kegiatan', summaryData.kegiatan.totalProgram, `${summaryData.kegiatan.kegiatanTerlaksana} terlaksana`, 'text-orange-600'],
    ['Pengumuman', (await getPengumumanList()).length, 'info aktif', 'text-amber-600'],
  ];
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Ringkasan Sistem</p>
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map(([title, value, description, color]) => (
          <Card key={String(title)}>
            <CardHeader className="pb-2 p-3.5 sm:p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground truncate">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 pt-0 sm:p-4 sm:pt-0">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <p className="text-[11px] text-muted-foreground mt-1">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export async function AdminDashboardOrganization() {
  const settings = await getCachedPengaturanSistem();
  return (
    <Card className="border bg-gradient-to-r from-background via-muted/20 to-muted/40 shadow-xs">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base text-foreground">{settings.profil.nama || 'Karang Taruna'}</span>
              {settings.profil.slogan && <span className="text-xs text-muted-foreground italic">&ldquo;{settings.profil.slogan}&rdquo;</span>}
            </div>
            <p className="text-xs text-muted-foreground">
              {settings.profil.alamat || 'Balai Warga'} {[settings.profil.unitWilayah, settings.profil.kelurahan, settings.profil.kota].filter(Boolean).join(', ')}
            </p>
          </div>
          <Link href="/pengaturan">
            <Button variant="outline" size="sm" className="gap-2 text-xs h-8">
              <Settings className="h-3.5 w-3.5 text-violet-600" />
              <span>Ubah Pengaturan Sistem</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export async function AdminDashboardFinance() {
  const summaryData = await getCachedPublicTransparencyData();
  const saldoPersen = summaryData.keuangan.totalMasuk > 0 ? Math.round(((summaryData.keuangan.totalMasuk - summaryData.keuangan.totalKeluar) / summaryData.keuangan.totalMasuk) * 100) : 0;
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-600" />
            Ringkasan Keuangan
          </CardTitle>
          <CardDescription>Laporan kas organisasi keseluruhan</CardDescription>
        </div>
        <Link href="/keuangan">
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            Detail <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          ['Total Masuk', summaryData.keuangan.totalMasuk, 'text-emerald-600'],
          ['Total Keluar', summaryData.keuangan.totalKeluar, 'text-rose-600'],
          ['Saldo Akhir', summaryData.keuangan.saldoAkhir, 'text-primary'],
        ].map(([label, value, color]) => (
          <div key={String(label)} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className={`font-semibold text-sm ${color}`}>{formatRupiah(Number(value))}</span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>Efisiensi kas</span>
          <span>{saldoPersen}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(saldoPersen, 100)}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}

export async function AdminDashboardActivity() {
  const diskusis = await getDiskusis();
  return (
    <Card className="lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-violet-600" />
            Aktivitas Sistem Terkini
          </CardTitle>
          <CardDescription>Diskusi & catatan umum terbaru</CardDescription>
        </div>
        <Link href="/diskusi">
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            Semua <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {diskusis.slice(0, 4).map((disc) => (
          <Link key={disc.id} href={`/diskusi/${disc.id}`} className="block">
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <MessageCircle className="h-4 w-4 text-violet-600" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm line-clamp-1">{disc.judul}</p>
                <p className="text-[11px] text-muted-foreground">
                  {disc.authorName} · {formatRelativeTime(disc.createdAt)}
                </p>
              </div>
              <span className="text-[11px] text-muted-foreground">{disc.balasanCount}</span>
            </div>
          </Link>
        ))}
        {diskusis.length === 0 && <p className="text-center py-8 text-xs text-muted-foreground">Belum ada diskusi atau catatan umum.</p>}
      </CardContent>
    </Card>
  );
}

export async function AdminDashboardSchedule() {
  const summaryData = await getCachedPublicTransparencyData();
  if (summaryData.kegiatan.jadwalMendatang.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-orange-500" />
          Jadwal Kegiatan Terbaru
        </CardTitle>
        <CardDescription>Kegiatan terbaru yang direncanakan organisasi</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {summaryData.kegiatan.jadwalMendatang.slice(0, 3).map((k) => (
          <Link key={k.id} href="/kegiatan" className="p-3 rounded-lg border bg-card">
            <p className="font-semibold text-sm line-clamp-1">{k.judul}</p>
            <p className="text-[11px] text-muted-foreground">
              {k.tanggal} · {k.bagian}
            </p>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
