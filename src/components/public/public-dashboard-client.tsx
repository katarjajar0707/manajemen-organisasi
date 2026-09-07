"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Wallet,
  Users,
  Calendar,
  ArrowRight,
  Shield,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  FileText,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  Award,
  HeartHandshake,
  Download,
  Mail,
  Phone,
  Printer,
  Loader2,
  AlertTriangle,
  Globe,
} from "lucide-react";
import { PublicTransparencyData, kirimAspirasiWarga } from "@/actions/transparansi";
import type { PengaturanSistemData } from "@/actions/pengaturan";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "KT";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

export function PublicDashboardClient({
  initialData,
  settings,
}: {
  initialData: PublicTransparencyData;
  settings?: PengaturanSistemData;
}) {
  const [data] = useState<PublicTransparencyData>(initialData);

  // Aspirasi Warga State
  const [namaWarga, setNamaWarga] = useState("");
  const [rtWarga, setRtWarga] = useState(settings?.profil.unitWilayah || "RT 01 / RW 05");
  const [pesanAspirasi, setPesanAspirasi] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Download / Cetak Modal
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const orgName = settings?.profil.nama || "Karang Taruna";
  const orgWilayah = [settings?.profil.unitWilayah, settings?.profil.kelurahan]
    .filter(Boolean)
    .join(" · ");
  const isKasPublik = settings?.keamanan?.transparansiKasPublik ?? true;

  const handleSubmitAspirasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaWarga.trim() || !pesanAspirasi.trim()) return;

    startTransition(async () => {
      await kirimAspirasiWarga({
        nama: namaWarga,
        rt: rtWarga,
        pesan: pesanAspirasi,
      });

      setIsSent(true);
      setTimeout(() => {
        setNamaWarga("");
        setPesanAspirasi("");
        setIsSent(false);
      }, 5000);
    });
  };

  const handlePrintRekap = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Jika portal publik dinonaktifkan oleh kebijakan organisasi
  if (settings?.keamanan && !settings.keamanan.portalPublikAktif) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <header className="flex h-16 w-full items-center justify-between border-b px-4 md:px-8 bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold shadow-sm">
              {getInitials(orgName)}
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base">{orgName}</span>
              {orgWilayah && <p className="text-[11px] text-muted-foreground">{orgWilayah}</p>}
            </div>
          </div>
          <Link href="/login">
            <Button size="sm">Masuk Portal Pengurus</Button>
          </Link>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
          <div className="p-4 rounded-full bg-muted/60 text-muted-foreground">
            <Shield className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold">Portal Publik Dinonaktifkan</h2>
          <p className="text-sm text-muted-foreground">
            Akses portal transparansi publik untuk {orgName} saat ini ditutup sesuai kebijakan organisasi. Silakan login ke portal pengurus jika Anda memiliki akun terdaftar.
          </p>
          <Link href="/login">
            <Button className="gap-2">
              <span>Masuk Portal Pengurus</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Banner Mode Maintenance jika aktif */}
      {settings?.keamanan?.modeMaintenance && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-800 dark:text-amber-200 px-4 py-2 text-xs text-center font-medium flex items-center justify-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
          <span>Sistem sedang dalam mode pemeliharaan berkala. Beberapa fitur mungkin sedang disesuaikan.</span>
        </div>
      )}

      {/* Header Publik */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 md:px-8 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          {settings?.profil.logoUrl ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden border border-border/80 shadow-xs bg-background shrink-0">
              <img
                src={settings.profil.logoUrl}
                alt={orgName}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold shadow-sm shrink-0">
              {getInitials(orgName)}
            </div>
          )}
          <div>
            <h1 className="text-sm sm:text-base font-bold leading-none tracking-tight">
              {orgName}
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {orgWilayah || "Portal Transparansi Publik"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login">
            <Button size="sm" className="gap-1.5 shadow-xs bg-primary hover:bg-primary/90 text-xs h-8">
              <span>Masuk Portal Pengurus</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 space-y-12 pb-16">
        {/* Hero Section */}
        <section className="relative px-4 pt-14 pb-12 md:pt-20 md:pb-16 text-center max-w-4xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-muted/40 text-xs text-muted-foreground shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium text-foreground">
              Portal Transparansi Publik · Periode {settings?.operasional.periodeAktif || "Aktif"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Keterbukaan Informasi & Kemandirian Pemuda
          </h2>

          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            {settings?.profil.slogan ||
              "Menyajikan data keuangan kas, jumlah anggota pemuda, jadwal kegiatan kemasyarakatan, dan kanal aspirasi warga secara transparan dan akuntabel."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {isKasPublik && (
              <Button
                size="sm"
                className="gap-2 h-9 px-5 shadow-sm"
                onClick={() => setIsDownloadOpen(true)}
              >
                <Download className="h-4 w-4" />
                <span>Lihat Ringkasan Kas Resmi</span>
              </Button>
            )}
            <a href="#aspirasi">
              <Button size="sm" variant="outline" className="gap-2 h-9 px-5">
                <MessageSquare className="h-4 w-4" />
                <span>Kirim Aspirasi Warga</span>
              </Button>
            </a>
          </div>
        </section>

        {/* Ringkasan Metrics */}
        <section className="px-4 md:px-8 max-w-6xl mx-auto grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-primary/20 shadow-xs hover:shadow-md transition-all relative overflow-hidden bg-card/70">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Saldo Kas Organisasi
              </CardTitle>
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Wallet className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {isKasPublik ? (
                <>
                  <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                    {formatRupiah(data.keuangan.saldoAkhir)}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold gap-0.5">
                      <TrendingUp className="h-3.5 w-3.5" /> Saldo Aktif
                    </span>
                    <span className="text-muted-foreground">Tersimpan di kas bendahara</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xl font-bold text-muted-foreground">Internal Only</div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Transparansi kas publik dinonaktifkan</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 shadow-xs hover:shadow-md transition-all relative overflow-hidden bg-card/70">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pemuda & Anggota Aktif
              </CardTitle>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {data.anggota.totalAktif} Anggota
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {data.anggota.keteranganRt}
              </p>
            </CardContent>
          </Card>

          <Card className="border-indigo-500/20 shadow-xs hover:shadow-md transition-all relative overflow-hidden bg-card/70 sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Agenda & Program Kerja
              </CardTitle>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Award className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {data.kegiatan.totalProgram} Program
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {data.kegiatan.kegiatanTerlaksana} kegiatan telah terlaksana
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Ringkasan Keuangan Transparan */}
        {isKasPublik && (
          <section className="px-4 md:px-8 max-w-6xl mx-auto">
            <Card className="border shadow-xs overflow-hidden">
              <CardHeader className="border-b bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Transparansi Arus Kas Terkini</CardTitle>
                    <CardDescription className="text-xs">
                      Ringkasan pemasukan & pengeluaran kas bendahara demi transparansi warga {orgName}.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs self-start sm:self-auto h-8"
                    onClick={() => setIsDownloadOpen(true)}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Rincian Ringkasan Kas</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border bg-emerald-500/5 space-y-1">
                    <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" /> Total Pemasukan Kas
                      </span>
                      <span className="text-sm font-bold">{formatRupiah(data.keuangan.totalMasuk)}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Iuran bulanan pengurus/anggota, donasi warga, dan bantuan swadaya masyarakat.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border bg-rose-500/5 space-y-1">
                    <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <TrendingDown className="h-4 w-4" /> Total Pengeluaran Kas
                      </span>
                      <span className="text-sm font-bold">{formatRupiah(data.keuangan.totalKeluar)}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Operasional kegiatan kemasyarakatan, perlengkapan inventaris, dan kepanitiaan.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Jadwal Kegiatan Publik */}
        <section className="px-4 md:px-8 max-w-6xl mx-auto space-y-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">Jadwal Kegiatan & Agenda Warga</h3>
            <p className="text-xs text-muted-foreground">
              Ayo hadir dan ramaikan program-program kepemudaan bersama seluruh warga {orgWilayah || orgName}.
            </p>
          </div>

          {data.kegiatan.jadwalMendatang.length === 0 ? (
            <Card className="p-8 text-center border-dashed bg-card/40">
              <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-semibold">Belum ada jadwal kegiatan mendatang</p>
              <p className="text-xs text-muted-foreground mt-1">
                Agenda dan kegiatan baru akan segera diumumkan oleh pengurus {orgName}.
              </p>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.kegiatan.jadwalMendatang.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-all border flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <Badge variant="outline" className="w-fit text-[10px] bg-primary/10 text-primary border-primary/20">
                      {item.bagian}
                    </Badge>
                    <CardTitle className="text-base font-semibold mt-2 leading-snug">
                      {item.judul}
                    </CardTitle>
                    {item.deskripsi && (
                      <CardDescription className="text-xs line-clamp-2 mt-1">
                        {item.deskripsi}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0 space-y-1.5 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>{item.tanggal}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>{item.waktu}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span>{item.lokasi}</span>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Sekretariat & Saluran Komunikasi Resmi */}
        <section className="px-4 md:px-8 max-w-6xl mx-auto space-y-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">
              Sekretariat & Saluran Komunikasi Resmi
            </h3>
            <p className="text-xs text-muted-foreground">
              Hubungi pengurus atau kunjungi sekretariat {orgName} untuk layanan dan koordinasi warga.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border bg-card/60">
              <CardHeader className="pb-2 flex flex-row items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xs font-semibold">Alamat Sekretariat</CardTitle>
                  <p className="text-[11px] text-muted-foreground">Balai Pertemuan Warga</p>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">{settings?.profil.alamat || "Balai Warga"}</p>
                <p>
                  {[settings?.profil.kelurahan, settings?.profil.kecamatan, settings?.profil.kota]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </CardContent>
            </Card>

            <Card className="border bg-card/60">
              <CardHeader className="pb-2 flex flex-row items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xs font-semibold">Email Resmi</CardTitle>
                  <p className="text-[11px] text-muted-foreground">Persuratan & Undangan</p>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <a
                  href={`mailto:${settings?.profil.email || ""}`}
                  className="font-medium text-foreground hover:text-primary transition-colors block truncate"
                >
                  {settings?.profil.email || "-"}
                </a>
                <p>Korespondensi resmi pengurus</p>
              </CardContent>
            </Card>

            <Card className="border bg-card/60">
              <CardHeader className="pb-2 flex flex-row items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xs font-semibold">Kontak & WhatsApp</CardTitle>
                  <p className="text-[11px] text-muted-foreground">Layanan Cepat Warga</p>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">{settings?.profil.telepon || "-"}</p>
                <p>Respon pesan & konfirmasi agenda</p>
              </CardContent>
            </Card>

            <Card className="border bg-card/60">
              <CardHeader className="pb-2 flex flex-row items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 shrink-0">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xs font-semibold">Media Sosial</CardTitle>
                  <p className="text-[11px] text-muted-foreground">Publikasi & Dokumentasi</p>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">{settings?.profil.instagram || "-"}</p>
                <p>Instagram & kanal publikasi</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Form Aspirasi & Kotak Saran Warga */}
        <section id="aspirasi" className="px-4 md:px-8 max-w-4xl mx-auto pt-4">
          <Card className="border shadow-sm bg-card/60">
            <CardHeader className="text-center pb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-1">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">Kanal Aspirasi & Masukan Warga</CardTitle>
              <CardDescription className="text-xs max-w-md mx-auto">
                Punya ide lomba, masukan sarana prasarana, atau saran untuk kemajuan kampung? Sampaikan kepada pengurus di sini.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isSent && (
                <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Aspirasi Anda berhasil dikirimkan! Terima kasih atas partisipasi aktif membangun lingkungan bersama.</span>
                </div>
              )}

              <form onSubmit={handleSubmitAspirasi} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nama Anda / Warga</label>
                    <Input
                      value={namaWarga}
                      onChange={(e) => setNamaWarga(e.target.value)}
                      placeholder="Contoh: Pak Bambang / Warga RT 02"
                      className="text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Domisili RT / Wilayah</label>
                    <Input
                      value={rtWarga}
                      onChange={(e) => setRtWarga(e.target.value)}
                      placeholder="Contoh: RT 03 / RW 05"
                      className="text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Pesan / Saran / Aspirasi</label>
                  <Textarea
                    rows={4}
                    value={pesanAspirasi}
                    onChange={(e) => setPesanAspirasi(e.target.value)}
                    placeholder="Tuliskan aspirasi, usulan program, atau kebutuhan warga secara detail..."
                    className="text-xs"
                    required
                  />
                </div>

                <Button type="submit" disabled={isPending} className="w-full gap-2 text-xs">
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  <span>Kirimkan Aspirasi Sekarang</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 px-4 md:px-8 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <p className="font-semibold text-foreground">
              © {new Date().getFullYear()} {orgName}
              {settings?.profil.unitWilayah ? ` (${settings.profil.unitWilayah})` : ""}. Seluruh hak cipta dilindungi.
            </p>
            <p className="text-[11px]">
              {[settings?.profil.alamat, settings?.profil.kelurahan, settings?.profil.kota]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            {settings?.profil.email && (
              <a
                href={`mailto:${settings.profil.email}`}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span>{settings.profil.email}</span>
              </a>
            )}
            {settings?.profil.telepon && (
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-primary" />
                <span>{settings.profil.telepon}</span>
              </span>
            )}
            {settings?.profil.instagram && (
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-primary" />
                <span>{settings.profil.instagram}</span>
              </span>
            )}
          </div>
        </div>
      </footer>

      {/* Dialog Ringkasan Kas Resmi */}
      {isKasPublik && (
        <Dialog open={isDownloadOpen} onOpenChange={setIsDownloadOpen}>
          <DialogContent className="max-w-md w-[95vw]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Laporan Ringkasan Kas Publik
              </DialogTitle>
              <DialogDescription className="text-xs">
                Transparansi saldo dan rekapitulasi keuangan {orgName}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3.5 rounded-lg bg-muted/40 border space-y-2">
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Total Pemasukan Kas:</span>
                  <span className="font-bold text-sm">{formatRupiah(data.keuangan.totalMasuk)}</span>
                </div>
                <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 font-medium">
                  <span>Total Pengeluaran Kas:</span>
                  <span className="font-bold text-sm">{formatRupiah(data.keuangan.totalKeluar)}</span>
                </div>
                <div className="border-t border-border/60 pt-2 flex justify-between items-center text-foreground font-bold">
                  <span>Saldo Akhir Kas:</span>
                  <span className="text-base text-primary">{formatRupiah(data.keuangan.saldoAkhir)}</span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                * Data kas ini disinkronkan secara realtime dari pencatatan bendahara umum dan diverifikasi untuk transparansi warga {orgName}.
              </p>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDownloadOpen(false)}>
                Tutup
              </Button>
              <Button onClick={handlePrintRekap} className="gap-1.5">
                <Printer className="h-3.5 w-3.5" />
                Cetak / Print
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

