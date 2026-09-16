'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Send,
  MessageSquare,
  Clock,
  ExternalLink,
  Shield,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { kirimAspirasiWarga } from '@/actions/transparansi';
import type { PengaturanSistemData } from '@/actions/pengaturan';
import FoldText from '@/components/public/fold-text';
import TextType from '@/components/public/text-type';

export function PublicKontakClient({ settings }: { settings?: PengaturanSistemData }) {
  // Aspirasi Warga Form State
  const [namaWarga, setNamaWarga] = useState('');
  const [rtWarga, setRtWarga] = useState(settings?.profil.unitWilayah || 'RT 01 / RW 05');
  const [pesanAspirasi, setPesanAspirasi] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [aspirasiError, setAspirasiError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [copiedEmail, setCopiedEmail] = useState(false);

  const orgName = settings?.profil.nama || 'Karang Taruna';
  const orgWilayah = [settings?.profil.unitWilayah, settings?.profil.kelurahan].filter(Boolean).join(' · ');
  const rawPhone = settings?.profil.telepon || '';
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
  const waLink = waNumber ? `https://wa.me/${waNumber}` : null;
  const emailAddress = settings?.profil.email || '';
  const igUsername = settings?.profil.instagram?.replace('@', '').trim() || '';
  const igLink = igUsername ? `https://instagram.com/${igUsername}` : null;
  const rawTiktok = settings?.profil.tiktok?.trim();
  const tiktokUsername = rawTiktok?.replace(/^@/, '');
  const tiktokLink = rawTiktok
    ? (rawTiktok.startsWith('http://') || rawTiktok.startsWith('https://')
        ? rawTiktok
        : `https://www.tiktok.com/@${tiktokUsername}`)
    : null;

  const fullAddress = [
    settings?.profil.alamat,
    settings?.profil.kelurahan,
    settings?.profil.kecamatan,
    settings?.profil.kota,
  ]
    .filter(Boolean)
    .join(', ');

  const mapsSearchUrl = fullAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
    : null;

  const handleCopyEmail = async () => {
    if (!emailAddress) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(emailAddress);
      }
      setCopiedEmail(true);
      toast.success('Email berhasil disalin');
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      toast.error('Gagal menyalin email');
    }
  };

  const handleSubmitAspirasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaWarga.trim() || !pesanAspirasi.trim()) return;

    setAspirasiError(null);
    startTransition(async () => {
      const result = await kirimAspirasiWarga({
        nama: namaWarga,
        rt: rtWarga,
        pesan: pesanAspirasi,
      });

      if (!result.success) {
        setAspirasiError(result.error || 'Aspirasi gagal dikirim.');
        return;
      }

      setIsSent(true);
      toast.success('Aspirasi Anda berhasil dikirim ke pengurus!');
      setTimeout(() => {
        setNamaWarga('');
        setPesanAspirasi('');
        setIsSent(false);
      }, 5000);
    });
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
          <p className="text-sm text-muted-foreground">
            Akses portal informasi publik untuk {orgName} saat ini ditutup sesuai kebijakan organisasi. Silakan login ke
            portal pengurus jika Anda memiliki akun terdaftar.
          </p>
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
      <main className="flex-1 space-y-12 py-8 sm:py-12">
        {/* Header Section */}
        <section className="px-4 md:px-8 max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <MessageSquare className="h-3.5 w-3.5" /> Pusat Layanan & Komunikasi
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            <FoldText
              text="Kontak & Sekretariat Resmi"
              splitBy="word"
              hinge="top"
              trigger="scroll"
              duration={0.99}
              stagger={0.08}
              ease="power3.out"
              perspective={700}
              creaseShading={0.5}
              color="currentColor"
            />
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed min-h-[3rem]">
            <TextType
              as="span"
              text={[
                `Pintu komunikasi terbuka untuk seluruh warga ${orgWilayah || orgName}. Hubungi pengurus, kunjungi sekretariat, atau sampaikan saran dan aspirasi Anda secara langsung.`,
                "Kami siap mendengar. Setiap aspirasi dan masukan warga adalah prioritas kami.",
                "Temukan kami di sekretariat, media sosial, atau kirim pesan langsung via WhatsApp.",
              ]}
              typingSpeed={38}
              deletingSpeed={20}
              pauseDuration={2800}
              showCursor={true}
              cursorCharacter="|"
              cursorClassName="text-primary"
              startOnVisible={true}
              loop={true}
            />
          </p>
        </section>

        {/* 4 Kartu Saluran Komunikasi Resmi */}
        <section className="px-4 md:px-8 max-w-6xl mx-auto space-y-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">Sekretariat & Saluran Komunikasi</h2>
            <p className="text-xs text-muted-foreground">
              Pilih kanal komunikasi yang paling nyaman untuk Anda hubungi.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Alamat Sekretariat */}
            <Card className="border bg-card/60 transition-all hover:shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-xs font-semibold">Alamat Sekretariat</CardTitle>
                  <p className="text-[11px] text-muted-foreground">Balai Pertemuan Warga</p>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2 pt-1">
                <p className="font-medium text-foreground leading-snug">
                  {settings?.profil.alamat || 'Balai Warga'}
                </p>
                <p className="line-clamp-2">
                  {[settings?.profil.kelurahan, settings?.profil.kecamatan, settings?.profil.kota]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {mapsSearchUrl && (
                  <a
                    href={mapsSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline pt-1"
                  >
                    <span>Buka Petunjuk Arah</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Email Resmi */}
            <Card className="border bg-card/60 transition-all hover:shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-xs font-semibold">Email Resmi</CardTitle>
                  <p className="text-[11px] text-muted-foreground">Persuratan & Undangan</p>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2 pt-1">
                <a
                  href={`mailto:${emailAddress}`}
                  className="font-medium text-foreground hover:text-primary transition-colors block truncate"
                  title={emailAddress}
                >
                  {emailAddress || '-'}
                </a>
                <p>Korespondensi resmi & kerja sama</p>
                {emailAddress && (
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-600 dark:text-sky-400 hover:underline pt-1"
                  >
                    {copiedEmail ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedEmail ? 'Tersalin!' : 'Salin Alamat Email'}</span>
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Kontak & WhatsApp */}
            <Card className="border bg-card/60 transition-all hover:shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-xs font-semibold">Kontak & WhatsApp</CardTitle>
                  <p className="text-[11px] text-muted-foreground">Layanan Cepat Warga</p>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2 pt-1">
                <p className="font-medium text-foreground">{settings?.profil.telepon || '-'}</p>
                <p>Respon pesan & konfirmasi agenda</p>
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline pt-1"
                  >
                    <span>Chat WhatsApp Pengurus</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Media Sosial */}
            <Card className="border bg-card/60 transition-all hover:shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center gap-3">
                <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 shrink-0">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-xs font-semibold">Media Sosial</CardTitle>
                  <p className="text-[11px] text-muted-foreground">Publikasi & Dokumentasi</p>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2 pt-1">
                <p className="font-medium text-foreground truncate">{settings?.profil.instagram || '-'}</p>
                <p>Instagram & dokumentasi kegiatan</p>
                {igLink && (
                  <a
                    href={igLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:underline pt-1"
                  >
                    <span>Buka Akun Instagram</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {tiktokLink && (
                  <a
                    href={tiktokLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-pink-600 dark:text-pink-400 hover:underline pt-1 block"
                  >
                    <span>Buka Akun TikTok</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Form Aspirasi & Kotak Saran Warga */}
        <section id="aspirasi" className="px-4 md:px-8 max-w-4xl mx-auto pt-2">
          <Card className="border shadow-sm bg-card/60">
            <CardHeader className="text-center pb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-1">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">Kanal Aspirasi & Masukan Warga</CardTitle>
              <CardDescription className="text-xs max-w-md mx-auto">
                Punya ide kegiatan, masukan sarana prasarana, atau aspirasi untuk kemajuan lingkungan? Sampaikan langsung
                kepada pengurus di sini.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isSent && (
                <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>
                    Aspirasi Anda berhasil dikirimkan! Terima kasih atas partisipasi aktif membangun lingkungan bersama.
                  </span>
                </div>
              )}
              {aspirasiError && (
                <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-medium text-destructive">
                  {aspirasiError}
                </div>
              )}

              <form onSubmit={handleSubmitAspirasi} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="namaWarga" className="text-xs font-medium">
                      Nama Anda / Warga
                    </label>
                    <Input
                      id="namaWarga"
                      value={namaWarga}
                      onChange={(e) => setNamaWarga(e.target.value)}
                      placeholder="Contoh: Pak Bambang / Warga RT 02"
                      className="text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="rtWarga" className="text-xs font-medium">
                      Domisili RT / Wilayah
                    </label>
                    <Input
                      id="rtWarga"
                      value={rtWarga}
                      onChange={(e) => setRtWarga(e.target.value)}
                      placeholder="Contoh: RT 03 / RW 05"
                      className="text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="pesanAspirasi" className="text-xs font-medium">
                    Pesan / Saran / Aspirasi
                  </label>
                  <Textarea
                    id="pesanAspirasi"
                    rows={4}
                    value={pesanAspirasi}
                    onChange={(e) => setPesanAspirasi(e.target.value)}
                    placeholder="Tuliskan aspirasi, usulan program, atau kebutuhan warga secara detail..."
                    className="text-xs leading-relaxed"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  loading={isPending}
                  className="w-full gap-2 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Kirimkan Aspirasi Sekarang</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* Informasi Tambahan / Jam Operasional */}
        <section className="px-4 md:px-8 max-w-4xl mx-auto">
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 text-xs text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground">Waktu Respon & Pelayanan Warga</p>
              <p>
                Pesan aspirasi dan koordinasi online dipantau berkala oleh jajaran pengurus harian. Untuk keperluan
                mendesak, silakan hubungi kontak WhatsApp resmi atau kunjungi sekretariat saat agenda pertemuan.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 px-4 md:px-8 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <p className="font-semibold text-foreground">
              © {new Date().getFullYear()} {orgName}
              {settings?.profil.unitWilayah ? ` (${settings.profil.unitWilayah})` : ''}. Seluruh hak cipta dilindungi.
            </p>
            <p className="text-[11px]">
              {[settings?.profil.alamat, settings?.profil.kelurahan, settings?.profil.kota]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2">
            {emailAddress && (
              <a
                href={`mailto:${emailAddress}`}
                aria-label={`Kirim email ke ${orgName}`}
                title={`Kirim email ke ${orgName}`}
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Mail className="h-5 w-5" aria-hidden="true" />
              </a>
            )}
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Chat WhatsApp ${orgName}`}
                title={`Chat WhatsApp ${orgName}`}
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
                  <path d="M12 2a9.9 9.9 0 0 0-8.56 14.88L2 22l5.27-1.38A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.08-1.12l-.29-.17-3.13.82.83-3.05-.19-.31A8 8 0 1 1 12 20Zm4.39-5.99c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-1.39-.69-2.3-1.23-3.21-2.79-.24-.42.24-.39.69-1.3.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.41-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.15 1.51.09.46-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
                </svg>
              </a>
            )}
            {igLink && (
              <a
                href={igLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram ${orgName}`}
                title={`Instagram ${orgName}`}
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect width="18" height="18" x="3" y="3" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            )}
            {tiktokLink && (
              <a
                href={tiktokLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`TikTok ${orgName}`}
                title={`TikTok ${orgName}`}
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.9-4.48V8.71a8.28 8.28 0 0 0 4.87 1.57v-3.5a4.84 4.84 0 0 1-1-.09Z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
