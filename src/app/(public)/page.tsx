"use client";

import { useState } from "react";
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
} from "lucide-react";

export default function PublicDashboardPage() {
  // Aspirasi Warga State
  const [namaWarga, setNamaWarga] = useState("");
  const [rtWarga, setRtWarga] = useState("RT 03");
  const [pesanAspirasi, setPesanAspirasi] = useState("");
  const [isSent, setIsSent] = useState(false);

  // Download Mockup Modal
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const handleSubmitAspirasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaWarga.trim() || !pesanAspirasi.trim()) return;
    setIsSent(true);
    setTimeout(() => {
      setNamaWarga("");
      setPesanAspirasi("");
      setIsSent(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Header Publik */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 md:px-8 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold shadow-sm">
            KT
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold leading-none tracking-tight">
              Karang Taruna Bhakti Karya
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">RW 05 Kelurahan Sukamaju</p>
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
            <span className="font-medium text-foreground">Portal Transparansi Publik 2026</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Keterbukaan Informasi & Kemandirian Pemuda
          </h2>

          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Menyajikan data keuangan kas, daftar agenda kemasyarakatan, susunan kepengurusan, dan kanal aspirasi warga secara transparan dan akuntabel.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="sm"
              className="gap-2 h-9 px-5 shadow-sm"
              onClick={() => setIsDownloadOpen(true)}
            >
              <Download className="h-4 w-4" />
              <span>Unduh Rekap Laporan Kas</span>
            </Button>
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
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                Rp 12.850.000
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold gap-0.5">
                  <TrendingUp className="h-3.5 w-3.5" /> +15.2%
                </span>
                <span className="text-muted-foreground">dari iuran warga & kas bulanan</span>
              </div>
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
                48 Anggota
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Terdistribusi aktif di unit RT 01 s/d RT 06
              </p>
            </CardContent>
          </Card>

          <Card className="border-indigo-500/20 shadow-xs hover:shadow-md transition-all relative overflow-hidden bg-card/70 sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Kegiatan Terlaksana
              </CardTitle>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Award className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                14 Program
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Bakti sosial, olahraga, dan perayaan HUT RI
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Ringkasan Keuangan Transparan */}
        <section className="px-4 md:px-8 max-w-6xl mx-auto">
          <Card className="border shadow-xs overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg">Transparansi Arus Kas Terkini</CardTitle>
                  <CardDescription className="text-xs">
                    Catatan pemasukan & pengeluaran kas bendahara yang diaudit secara berkala.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs self-start sm:self-auto h-8"
                  onClick={() => setIsDownloadOpen(true)}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Lihat Buku Kas Lengkap</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-emerald-500/5 space-y-1">
                  <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" /> Total Pemasukan Q1
                    </span>
                    <span>Rp 18.500.000</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Iuran bulanan anggota, donatur warga, dan bantuan swadaya masyarakat.
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-rose-500/5 space-y-1">
                  <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <TrendingDown className="h-4 w-4" /> Total Pengeluaran Q1
                    </span>
                    <span>Rp 5.650.000</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Pengadaan perlengkapan pos ronda, operasional kerja bakti, dan konsumsi rapat.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Jadwal Kegiatan Publik */}
        <section className="px-4 md:px-8 max-w-6xl mx-auto space-y-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">Jadwal Kegiatan & Agenda Warga</h3>
            <p className="text-xs text-muted-foreground">
              Ayo hadir dan ramaikan program-program kepemudaan bersama seluruh warga RW 05.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Kerja Bakti & Penghijauan Lingkungan RW",
                date: "Minggu, 14 September 2026",
                time: "07.00 - 11.00 WIB",
                location: "Balai Warga RW 05",
                tag: "Lingkungan Hidup",
                tagColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
              },
              {
                title: "Turnamen Badminton Antar RT Seri II",
                date: "Sabtu, 20 September 2026",
                time: "19.30 - 22.30 WIB",
                location: "Lapangan Serbaguna RT 04",
                tag: "Olahraga",
                tagColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
              },
              {
                title: "Rapat Pleno Persiapan Panggung Gembira",
                date: "Jumat, 26 September 2026",
                time: "20.00 - 22.00 WIB",
                location: "Sekretariat Karang Taruna",
                tag: "Organisasi",
                tagColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
              },
            ].map((item, idx) => (
              <Card key={idx} className="hover:shadow-md transition-all border flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <Badge variant="outline" className={`w-fit text-[10px] ${item.tagColor}`}>
                    {item.tag}
                  </Badge>
                  <CardTitle className="text-base font-semibold mt-2 leading-snug">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>{item.date}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>{item.time}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>{item.location}</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Form Aspirasi & Kotak Saran Warga */}
        <section id="aspirasi" className="px-4 md:px-8 max-w-4xl mx-auto pt-6">
          <Card className="border shadow-sm bg-card/60">
            <CardHeader className="text-center pb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-1">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">Kanal Aspirasi & Masukan Warga</CardTitle>
              <CardDescription className="text-xs max-w-md mx-auto">
                Punya ide lomba, keluhan sarana, atau saran untuk kemajuan kampung? Sampaikan kepada pengurus di sini.
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
                      placeholder="Contoh: Pak Bambang"
                      className="text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Domisili RT</label>
                    <Input
                      value={rtWarga}
                      onChange={(e) => setRtWarga(e.target.value)}
                      placeholder="Contoh: RT 03"
                      className="text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Isi Saran / Aspirasi</label>
                  <Textarea
                    value={pesanAspirasi}
                    onChange={(e) => setPesanAspirasi(e.target.value)}
                    placeholder="Tuliskan masukan Anda terkait sarana pos ronda, perlengkapan olahraga, atau ide acara..."
                    rows={3}
                    className="text-xs leading-relaxed"
                    required
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Button type="submit" size="sm" className="gap-2 px-6 shadow-xs">
                    <Send className="h-3.5 w-3.5" />
                    <span>Kirim Aspirasi</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20 py-10 px-4 md:px-8 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs">
                KT
              </div>
              <span className="font-bold text-foreground text-sm">Karang Taruna Bhakti Karya</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Wadah partisipasi generasi muda untuk berkarya, berinovasi, dan mengabdi bagi kemajuan warga RW 05.
            </p>
          </div>

          <div className="space-y-1 text-xs">
            <h5 className="font-semibold text-foreground mb-1.5">Sekretariat & Balai Warga</h5>
            <p className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>Jl. Pemuda Harapan No. 12, RW 05</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-primary" />
              <span>0812-3456-7890 (Sekretariat)</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-primary" />
              <span>info@karangtaruna.id</span>
            </p>
          </div>

          <div className="space-y-1 text-xs">
            <h5 className="font-semibold text-foreground mb-1.5">Akses Cepat</h5>
            <p><Link href="/login" className="hover:text-primary transition-colors">Portal Internal Pengurus</Link></p>
            <p><a href="#aspirasi" className="hover:text-primary transition-colors">Form Kotak Aspirasi</a></p>
            <p><button onClick={() => setIsDownloadOpen(true)} className="hover:text-primary transition-colors text-left">Unduh Buku Kas Publik</button></p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>© 2026 Karang Taruna Bhakti Karya. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-1.5 text-[11px]">
            <Shield className="h-3 w-3 text-emerald-500" />
            <span>Sistem Keterbukaan Informasi Warga</span>
          </div>
        </div>
      </footer>

      {/* Download Kas Dialog Modal */}
      <Dialog open={isDownloadOpen} onOpenChange={setIsDownloadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Unduh Rekapitulasi Kas Publik</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Laporan keuangan resmi bendahara yang diaudit untuk periode berjalan tahun 2026.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 py-2 text-xs">
            <div className="p-3 border rounded-xl bg-muted/40 space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Rekap Mutasi Kas Q1 2026</span>
                <Badge variant="outline" className="text-[10px]">PDF (1.8 MB)</Badge>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Mencakup rincian saldo masuk Rp 18.500.000 dan saldo keluar Rp 5.650.000.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsDownloadOpen(false)}>
              Tutup
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                alert("Mengunduh Rekap Kas Publik Q1 2026 (PDF)...");
                setIsDownloadOpen(false);
              }}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh Sekarang</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
