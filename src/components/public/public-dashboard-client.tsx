'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LanyardHero } from '@/components/public/lanyard-hero';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, ArrowRight, Shield, FileText, MapPin, Clock, Mail, Printer, AlertTriangle } from 'lucide-react';
import { PublicTransparencyData } from '@/actions/transparansi';
import type { PengaturanSistemData } from '@/actions/pengaturan';
import DriftWall from '@/components/public/drift-wall';
import FoldText from '@/components/public/fold-text';
import StarBorder from '@/components/public/star-border';
import TextType from '@/components/public/text-type';

const MEMBER_IMAGES = [
  '/lanyard/user/03412418-feec-420b-a0b5-8f6df7386aae.png',
  '/lanyard/user/0bd44bf8-447c-4e6e-9721-d6014fa3a8c1.png',
  '/lanyard/user/15d2875e-e12d-4508-9018-ddf429249c1b.png',
  '/lanyard/user/3170f581-ac51-4802-9ba0-4901a4a32715.png',
  '/lanyard/user/4beba624-2ba5-41f1-9672-cdb75b80a19e.png',
  '/lanyard/user/4f6c3e0d-3836-43ab-b745-18c14a46f8ff.png',
  '/lanyard/user/561a38a3-c983-4651-80a6-7e2aa2439608.png',
  '/lanyard/user/6daedf2d-dd9b-4878-b0bf-d46a126dafcb.png',
  '/lanyard/user/71597135-7fd2-41ad-8015-71e3139238ad.png',
  '/lanyard/user/786c8556-2e03-4022-a5fa-1d9deef34abf.png',
  '/lanyard/user/7bf1f387-1d9d-4ae5-9147-f57839735281.png',
  '/lanyard/user/93816c43-cdb4-451a-b5a2-bcaf727146b2.png',
  '/lanyard/user/9a5b9c30-5d81-4f36-b90e-5f81ab03f9de.png',
  '/lanyard/user/a985054a-1753-4eca-acd7-39e9eefe8977.png',
  '/lanyard/user/b522716f-465f-4c05-9db6-f5d46a763e60.png',
  '/lanyard/user/bd9820b5-6a72-46d9-bd0a-73ea9cd718bc.png',
  '/lanyard/user/c6271b9a-6d33-4957-accd-432b76421b9f.png',
  '/lanyard/user/d9225e53-5121-4d9f-99dc-36faecc11f44.png',
  '/lanyard/user/db3a9ea8-4008-450b-86f5-d9906df76bd6.png',
  '/lanyard/user/e0f607d9-0dcb-4009-bf59-1b7296ce25a8.png',
  '/lanyard/user/ea366256-7e1a-4f6e-b197-fde986be5372.png',
  '/lanyard/user/f30f163a-159d-49bc-b357-07ea1e947048.png',
  '/lanyard/user/f7af9da9-15d9-4892-abac-8b1c00a578bf.png',
  '/lanyard/user/fb883738-90f1-45c0-ae23-a25147614ff0.png',
  '/lanyard/user/03412418-feec-420b-a0b5-8f6df7386aae.png',
  '/lanyard/user/0bd44bf8-447c-4e6e-9721-d6014fa3a8c1.png',
  '/lanyard/user/15d2875e-e12d-4508-9018-ddf429249c1b.png',
  '/lanyard/user/3170f581-ac51-4802-9ba0-4901a4a32715.png',
  '/lanyard/user/4beba624-2ba5-41f1-9672-cdb75b80a19e.png',
  '/lanyard/user/4f6c3e0d-3836-43ab-b745-18c14a46f8ff.png',
  '/lanyard/user/561a38a3-c983-4651-80a6-7e2aa2439608.png',
  '/lanyard/user/6daedf2d-dd9b-4878-b0bf-d46a126dafcb.png',
  '/lanyard/user/71597135-7fd2-41ad-8015-71e3139238ad.png',
  '/lanyard/user/786c8556-2e03-4022-a5fa-1d9deef34abf.png',
  '/lanyard/user/7bf1f387-1d9d-4ae5-9147-f57839735281.png',
  '/lanyard/user/93816c43-cdb4-451a-b5a2-bcaf727146b2.png',
  '/lanyard/user/9a5b9c30-5d81-4f36-b90e-5f81ab03f9de.png',
  '/lanyard/user/a985054a-1753-4eca-acd7-39e9eefe8977.png',
  '/lanyard/user/b522716f-465f-4c05-9db6-f5d46a763e60.png',
  '/lanyard/user/bd9820b5-6a72-46d9-bd0a-73ea9cd718bc.png',
  '/lanyard/user/c6271b9a-6d33-4957-accd-432b76421b9f.png',
  '/lanyard/user/d9225e53-5121-4d9f-99dc-36faecc11f44.png',
  '/lanyard/user/db3a9ea8-4008-450b-86f5-d9906df76bd6.png',
  '/lanyard/user/e0f607d9-0dcb-4009-bf59-1b7296ce25a8.png',
  '/lanyard/user/ea366256-7e1a-4f6e-b197-fde986be5372.png',
  '/lanyard/user/f30f163a-159d-49bc-b357-07ea1e947048.png',
  '/lanyard/user/f7af9da9-15d9-4892-abac-8b1c00a578bf.png',
  '/lanyard/user/fb883738-90f1-45c0-ae23-a25147614ff0.png',
  '/lanyard/user/03412418-feec-420b-a0b5-8f6df7386aae.png',
  '/lanyard/user/0bd44bf8-447c-4e6e-9721-d6014fa3a8c1.png',
  '/lanyard/user/15d2875e-e12d-4508-9018-ddf429249c1b.png',
  '/lanyard/user/3170f581-ac51-4802-9ba0-4901a4a32715.png',
  '/lanyard/user/4beba624-2ba5-41f1-9672-cdb75b80a19e.png',
  '/lanyard/user/4f6c3e0d-3836-43ab-b745-18c14a46f8ff.png',
  '/lanyard/user/561a38a3-c983-4651-80a6-7e2aa2439608.png',
  '/lanyard/user/6daedf2d-dd9b-4878-b0bf-d46a126dafcb.png',
  '/lanyard/user/71597135-7fd2-41ad-8015-71e3139238ad.png',
  '/lanyard/user/786c8556-2e03-4022-a5fa-1d9deef34abf.png',
  '/lanyard/user/7bf1f387-1d9d-4ae5-9147-f57839735281.png',
  '/lanyard/user/93816c43-cdb4-451a-b5a2-bcaf727146b2.png',
  '/lanyard/user/9a5b9c30-5d81-4f36-b90e-5f81ab03f9de.png',
  '/lanyard/user/a985054a-1753-4eca-acd7-39e9eefe8977.png',
  '/lanyard/user/b522716f-465f-4c05-9db6-f5d46a763e60.png',
  '/lanyard/user/bd9820b5-6a72-46d9-bd0a-73ea9cd718bc.png',
  '/lanyard/user/c6271b9a-6d33-4957-accd-432b76421b9f.png',
  '/lanyard/user/d9225e53-5121-4d9f-99dc-36faecc11f44.png',
  '/lanyard/user/db3a9ea8-4008-450b-86f5-d9906df76bd6.png',
  '/lanyard/user/e0f607d9-0dcb-4009-bf59-1b7296ce25a8.png',
  '/lanyard/user/ea366256-7e1a-4f6e-b197-fde986be5372.png',
  '/lanyard/user/f30f163a-159d-49bc-b357-07ea1e947048.png',
  '/lanyard/user/f7af9da9-15d9-4892-abac-8b1c00a578bf.png',
  '/lanyard/user/fb883738-90f1-45c0-ae23-a25147614ff0.png',
  '/lanyard/user/03412418-feec-420b-a0b5-8f6df7386aae.png',
  '/lanyard/user/0bd44bf8-447c-4e6e-9721-d6014fa3a8c1.png',
  '/lanyard/user/15d2875e-e12d-4508-9018-ddf429249c1b.png',
  '/lanyard/user/3170f581-ac51-4802-9ba0-4901a4a32715.png',
  '/lanyard/user/4beba624-2ba5-41f1-9672-cdb75b80a19e.png',
  '/lanyard/user/4f6c3e0d-3836-43ab-b745-18c14a46f8ff.png',
  '/lanyard/user/561a38a3-c983-4651-80a6-7e2aa2439608.png',
  '/lanyard/user/6daedf2d-dd9b-4878-b0bf-d46a126dafcb.png',
  '/lanyard/user/71597135-7fd2-41ad-8015-71e3139238ad.png',
  '/lanyard/user/786c8556-2e03-4022-a5fa-1d9deef34abf.png',
  '/lanyard/user/7bf1f387-1d9d-4ae5-9147-f57839735281.png',
  '/lanyard/user/93816c43-cdb4-451a-b5a2-bcaf727146b2.png',
  '/lanyard/user/9a5b9c30-5d81-4f36-b90e-5f81ab03f9de.png',
  '/lanyard/user/a985054a-1753-4eca-acd7-39e9eefe8977.png',
  '/lanyard/user/b522716f-465f-4c05-9db6-f5d46a763e60.png',
  '/lanyard/user/bd9820b5-6a72-46d9-bd0a-73ea9cd718bc.png',
  '/lanyard/user/c6271b9a-6d33-4957-accd-432b76421b9f.png',
  '/lanyard/user/d9225e53-5121-4d9f-99dc-36faecc11f44.png',
  '/lanyard/user/db3a9ea8-4008-450b-86f5-d9906df76bd6.png',
  '/lanyard/user/e0f607d9-0dcb-4009-bf59-1b7296ce25a8.png',
  '/lanyard/user/ea366256-7e1a-4f6e-b197-fde986be5372.png',
  '/lanyard/user/f30f163a-159d-49bc-b357-07ea1e947048.png',
  '/lanyard/user/f7af9da9-15d9-4892-abac-8b1c00a578bf.png',
  '/lanyard/user/fb883738-90f1-45c0-ae23-a25147614ff0.png',
].map((path) => ({ image: path }));

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Responsive wrapper: ukuran tile lebih kecil di mobile (<640 px). */
function DriftWallSection() {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <section aria-label="Galeri Anggota" className="relative mt-4">
      <div className="text-center mb-2 px-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Tim Kami</p>
        <h2 className="text-2xl font-bold tracking-tight mt-1">
          <FoldText
            text="Meet the Gang"
            splitBy="char"
            hinge="top"
            trigger="scroll"
            duration={0.6}
            stagger={0.05}
            ease="power3.out"
            perspective={700}
            creaseShading={0.55}
            color="currentColor"
          />
        </h2>
      </div>
      <div style={{ height: isMobile ? 380 : 480 }}>
        <DriftWall
          items={MEMBER_IMAGES}
          columns={isMobile ? 4 : 5}
          tileWidth={isMobile ? 130 : 180}
          tileHeight={isMobile ? 162 : 220}
          gap={isMobile ? 10 : 14}
          radius={14}
          tilt={14}
          turn={-10}
          perspective={1200}
          depth={100}
          speed={36}
          direction="up"
          variance={0.4}
          parallax={0.5}
          lift={isMobile ? 40 : 56}
          fade={0.55}
          dim={0.5}
          grayscale
          overlayColor="hsl(220 20% 4%)"
        />
      </div>
    </section>
  );
}

export function PublicDashboardClient({ initialData, settings }: { initialData: PublicTransparencyData; settings?: PengaturanSistemData }) {
  const [data] = useState<PublicTransparencyData>(initialData);

  // Download / Cetak Modal
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const orgName = settings?.profil.nama || 'Karang Taruna';
  const orgWilayah = [settings?.profil.unitWilayah, settings?.profil.kelurahan].filter(Boolean).join(' · ');
  const isKasPublik = settings?.keamanan?.transparansiKasPublik ?? true;

  const handlePrintRekap = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Jika portal publik dinonaktifkan oleh kebijakan organisasi
  if (settings?.keamanan && !settings.keamanan.portalPublikAktif) {
    return (
      <div className="min-h-[calc(100vh-4.25rem)] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
          <div className="p-4 rounded-full bg-muted/60 text-muted-foreground">
            <Shield className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold">Portal Publik Dinonaktifkan</h2>
          <p className="text-sm text-muted-foreground">Akses portal transparansi publik untuk {orgName} saat ini ditutup sesuai kebijakan organisasi. Silakan login ke portal pengurus jika Anda memiliki akun terdaftar.</p>
          <Link href="/login">
            <Button className="gap-2">
              <span>Masuk</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4.25rem)] flex-col selection:bg-primary/20">
      {/* Banner Mode Maintenance jika aktif */}
      {settings?.keamanan?.modeMaintenance && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-800 dark:text-amber-200 px-4 py-2 text-xs text-center font-medium flex items-center justify-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
          <span>Mode pemeliharaan aktif. Akses publik sedang dibatasi.</span>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 space-y-12 pb-16">
        <LanyardHero orgName={orgName} />

        {/* Jadwal Kegiatan Publik */}
        <section className="px-4 md:px-8 max-w-6xl mx-auto space-y-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">
              <FoldText
                text="Jadwal Kegiatan & Agenda Warga"
                splitBy="word"
                hinge="top"
                trigger="scroll"
                duration={0.55}
                stagger={0.07}
                ease="power3.out"
                perspective={700}
                creaseShading={0.5}
                color="currentColor"
              />
            </h3>
            <p className="text-xs text-muted-foreground min-h-[2.5rem]">
              <TextType
                as="span"
                text={[
                  `Ayo hadir dan ramaikan program-program kepemudaan bersama seluruh warga ${orgWilayah || orgName}.`,
                  "Informasi arus kas KartaTuju yang disajikan secara terbuka. Halaman ini hanya untuk melihat data dan tidak menyediakan pengubahan transaksi.",
                  "Pintu komunikasi terbuka untuk seluruh warga RT 07 RW 07 · Kelurahan Jatijajar. Hubungi pengurus, kunjungi sekretariat, atau sampaikan saran dan aspirasi Anda secara langsung.",
                ]}
                typingSpeed={35}
                deletingSpeed={18}
                pauseDuration={2500}
                showCursor={true}
                cursorCharacter="|"
                cursorClassName="text-primary"
                startOnVisible={true}
                loop={true}
              />
            </p>
          </div>

          {data.kegiatan.jadwalMendatang.length === 0 ? (
            <Card className="p-8 text-center border-dashed bg-card/40">
              <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-semibold">Belum ada jadwal kegiatan mendatang</p>
              <p className="text-xs text-muted-foreground mt-1">Agenda dan kegiatan baru akan segera diumumkan oleh pengurus {orgName}.</p>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.kegiatan.jadwalMendatang.map((item) => (
                <StarBorder
                  key={item.id}
                  as="div"
                  className="w-full"
                  color="hsl(var(--primary))"
                  secondColor="hsl(var(--star-secondary))"
                  speed="7s"
                  thickness={2}
                >
                  <Card className="hover:shadow-md transition-all border-0 flex flex-col justify-between rounded-[19px] bg-card">
                    <CardHeader className="pb-3">
                      <Badge variant="outline" className="w-fit text-[10px] bg-primary/10 text-primary border-primary/20">
                        {item.bagian}
                      </Badge>
                      <CardTitle className="text-base font-semibold mt-2 leading-snug">{item.judul}</CardTitle>
                      {item.deskripsi && <CardDescription className="text-xs line-clamp-2 mt-1">{item.deskripsi}</CardDescription>}
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
                </StarBorder>
              ))}
            </div>
          )}
        </section>

        {/* DriftWall — galeri foto pengurus */}
        <DriftWallSection />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 px-4 md:px-8 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <p className="font-semibold text-foreground">
              © {new Date().getFullYear()} {orgName}
              {settings?.profil.unitWilayah ? ` (${settings.profil.unitWilayah})` : ''}. Seluruh hak cipta dilindungi.
            </p>
            <p className="text-[11px]">{[settings?.profil.alamat, settings?.profil.kelurahan, settings?.profil.kota].filter(Boolean).join(' · ')}</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <a
              href="mailto:katarjajar0707@gmail.com"
              aria-label="Kirim email ke Kartar Jajar"
              title="Kirim email ke Kartar Jajar"
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Mail className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="https://wa.me/6285711256012"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat WhatsApp Kartar Jajar"
              title="Chat WhatsApp Kartar Jajar"
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
                <path d="M12 2a9.9 9.9 0 0 0-8.56 14.88L2 22l5.27-1.38A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.08-1.12l-.29-.17-3.13.82.83-3.05-.19-.31A8 8 0 1 1 12 20Zm4.39-5.99c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-1.39-.69-2.3-1.23-3.21-2.79-.24-.42.24-.39.69-1.3.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.41-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.15 1.51.09.46-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
              </svg>
            </a>
            <a
              href="https://instagram.com/kartatuju"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Kartar Jajar"
              title="Instagram Kartar Jajar"
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect width="18" height="18" x="3" y="3" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
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
              <DialogDescription className="text-xs">Transparansi saldo dan rekapitulasi keuangan {orgName}.</DialogDescription>
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

              <p className="text-[11px] text-muted-foreground leading-relaxed">* Data kas ini disinkronkan secara realtime dari pencatatan bendahara umum dan diverifikasi untuk transparansi warga {orgName}.</p>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDownloadOpen(false)}>
                Tutup
              </Button>
              <Button onClick={handlePrintRekap} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
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
