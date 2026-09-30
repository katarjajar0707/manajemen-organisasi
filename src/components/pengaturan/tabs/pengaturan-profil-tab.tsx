'use client';

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Phone,
  Mail,
  Globe,
  Camera,
  Upload,
  Trash2,
  Loader2,
} from 'lucide-react';
import { ProfilOrganisasi, updatePengaturanProfil } from '@/actions/pengaturan';
import { uploadLampiran } from '@/actions/storage';
import { isImageFile } from '@/lib/utils';
import { convertHeicToJpeg } from '@/lib/client-image';
import { PreviewImage } from '@/components/common/preview-image';

interface PengaturanProfilTabProps {
  orgProfile: ProfilOrganisasi;
  setOrgProfile: React.Dispatch<React.SetStateAction<ProfilOrganisasi>>;
  onToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export function PengaturanProfilTab({
  orgProfile,
  setOrgProfile,
  onToast,
}: PengaturanProfilTabProps) {
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isImageFile(file)) {
      onToast('File logo harus berupa gambar.', 'warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onToast('Ukuran logo tidak boleh melebihi 5MB.', 'warning');
      return;
    }

    try {
      setIsUploadingLogo(true);
      let uploadFile: File;
      try {
        uploadFile = await convertHeicToJpeg(file);
      } catch {
        onToast('File HEIC tidak dapat dikonversi menjadi JPG.', 'warning');
        return;
      }

      const res = await uploadLampiran(uploadFile, 'logo');
      if (res.error || !res.url) {
        onToast(res.error || 'Gagal mengunggah logo ke storage.', 'warning');
        return;
      }

      setOrgProfile((prev) => ({ ...prev, logoUrl: res.url }));
      const saveRes = await updatePengaturanProfil({ logoUrl: res.url });
      if (saveRes.success) {
        onToast('Logo Karang Taruna berhasil diperbarui dan disimpan!', 'success');
      } else {
        onToast("Logo terunggah, silakan klik tombol 'Simpan Profil' untuk menyimpan.", 'info');
      }
    } catch (err: unknown) {
      onToast(err instanceof Error ? err.message : 'Terjadi kesalahan saat upload logo.', 'warning');
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    setOrgProfile((prev) => ({ ...prev, logoUrl: null }));
    const saveRes = await updatePengaturanProfil({ logoUrl: null });
    if (saveRes.success) {
      onToast('Logo dihapus. Menggunakan inisial default.', 'info');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await updatePengaturanProfil(orgProfile);
      if (res.success) {
        onToast('Pengaturan profil organisasi berhasil disimpan ke database!', 'success');
      } else {
        onToast(res.error || 'Gagal menyimpan profil organisasi.', 'warning');
      }
    } catch (err: unknown) {
      onToast(err instanceof Error ? err.message : 'Terjadi kesalahan server.', 'warning');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <form onSubmit={handleSaveProfile} className="space-y-5">
      {/* Logo & Identitas Singkat */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Identitas Karang Taruna
          </CardTitle>
          <CardDescription>Informasi ini digunakan pada kop surat, laporan resmi, dan header portal publik.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Logo Terintegrasi Database & Storage */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-border/50">
            <input ref={logoInputRef} type="file" accept="image/*,.heic,.heif" onChange={handleLogoChange} className="hidden" />

            <div onClick={() => !isUploadingLogo && logoInputRef.current?.click()} className="relative group cursor-pointer" title="Klik untuk mengganti logo">
              {isUploadingLogo ? (
                <div className="h-20 w-20 rounded-xl bg-muted border border-border flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : orgProfile.logoUrl ? (
                <div className="h-20 w-20 rounded-xl overflow-hidden border-2 border-primary/30 shadow-md bg-background relative">
                  <PreviewImage src={orgProfile.logoUrl} alt="Logo Karang Taruna" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div
                    className="h-20 w-20 rounded-xl flex items-center justify-center text-primary-foreground text-2xl font-black shadow-md border border-primary/30"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-strong)))',
                      boxShadow: '0 0 16px var(--primary-glow)',
                    }}
                  >
                    KT
                  </div>
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold">Logo Karang Taruna</h4>
                {orgProfile.logoUrl && (
                  <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                    Logo Kustom Aktif
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Semua format gambar (Rasio 1:1 direkomendasikan, maks. 5MB).</p>
              <div className="flex items-center gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" disabled={isUploadingLogo} onClick={() => logoInputRef.current?.click()} className="h-8 gap-1.5 text-xs">
                  {isUploadingLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  <span>{isUploadingLogo ? 'Mengunggah...' : 'Ganti Logo'}</span>
                </Button>

                {orgProfile.logoUrl && (
                  <Button type="button" variant="ghost" size="sm" onClick={handleRemoveLogo} className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 px-2">
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nama-organisasi" className="text-xs">
                Nama Karang Taruna <span className="text-destructive">*</span>
              </Label>
              <Input id="nama-organisasi" value={orgProfile.nama} onChange={(e) => setOrgProfile({ ...orgProfile, nama: e.target.value })} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="unit-wilayah" className="text-xs">
                Unit / Tingkat Wilayah
              </Label>
              <Input id="unit-wilayah" value={orgProfile.unitWilayah} onChange={(e) => setOrgProfile({ ...orgProfile, unitWilayah: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="kelurahan" className="text-xs">
                Kelurahan / Desa
              </Label>
              <Input id="kelurahan" value={orgProfile.kelurahan} onChange={(e) => setOrgProfile({ ...orgProfile, kelurahan: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kecamatan" className="text-xs">
                Kecamatan
              </Label>
              <Input id="kecamatan" value={orgProfile.kecamatan} onChange={(e) => setOrgProfile({ ...orgProfile, kecamatan: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kota" className="text-xs">
                Kota / Kabupaten
              </Label>
              <Input id="kota" value={orgProfile.kota} onChange={(e) => setOrgProfile({ ...orgProfile, kota: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slogan" className="text-xs">
              Slogan / Visi Singkat
            </Label>
            <Input id="slogan" value={orgProfile.slogan} onChange={(e) => setOrgProfile({ ...orgProfile, slogan: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="alamat" className="text-xs">
              Alamat Sekretariat
            </Label>
            <Input id="alamat" value={orgProfile.alamat} onChange={(e) => setOrgProfile({ ...orgProfile, alamat: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      {/* Kontak Resmi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-4 w-4 text-emerald-400" />
            Saluran Komunikasi Resmi
          </CardTitle>
          <CardDescription>Kontak resmi pengurus untuk keperluan warga, instansi kelurahan, dan publik.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              Email Resmi
            </Label>
            <Input id="email" type="email" value={orgProfile.email} onChange={(e) => setOrgProfile({ ...orgProfile, email: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="telepon" className="text-xs flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              WhatsApp Pengurus
            </Label>
            <Input id="telepon" value={orgProfile.telepon} onChange={(e) => setOrgProfile({ ...orgProfile, telepon: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="instagram" className="text-xs flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              Instagram Organisasi
            </Label>
            <Input id="instagram" value={orgProfile.instagram} onChange={(e) => setOrgProfile({ ...orgProfile, instagram: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tiktok" className="text-xs flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-muted-foreground" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.9-4.48V8.71a8.28 8.28 0 0 0 4.87 1.57v-3.5a4.84 4.84 0 0 1-1-.09Z" />
              </svg>
              TikTok Organisasi
            </Label>
            <Input
              id="tiktok"
              placeholder="@username atau username"
              value={orgProfile.tiktok ?? ''}
              onChange={(e) => setOrgProfile({ ...orgProfile, tiktok: e.target.value })}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-border/50 pt-4">
          <Button type="submit" loading={isSavingProfile} className="gap-2 bg-primary text-primary-foreground">
            <span>Simpan Profil Organisasi</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
