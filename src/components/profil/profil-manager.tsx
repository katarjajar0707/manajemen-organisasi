'use client';

import { useState, useTransition } from 'react';
import { AlertCircle, Building2, Camera, CheckCircle2, KeyRound, Loader2, Mail, Phone, Shield, Upload, UserPen, UserRound } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { changePassword, updateAvatar, updateMyProfile } from '@/actions/profil';
import { LogoutButton } from '@/components/common/logout-button';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { ColorThemeSwitcher } from '@/components/common/color-theme-switcher';
import { convertHeicToJpeg } from '@/lib/client-image';
import { cn, isImageFile } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';

interface ProfileData {
  id: string;
  nama: string;
  username: string;
  foto_url: string | null;
  bio: string | null;
  role: 'admin' | 'ketua' | 'anggota';
  created_at: string;
  email?: string;
  nomor_wa?: string;
  bagian?: { id: string; nama: string; slug: string } | null;
}

const ROLE_LABELS: Record<string, string> = { admin: 'Administrator', ketua: 'Ketua Karang Taruna', anggota: 'Anggota' };

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}

function formatJoinedDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(value));
}

export function ProfilManager({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const setStoreAvatarUrl = useAuthStore((state) => state.setAvatarUrl);
  const setStoreUserName = useAuthStore((state) => state.setUserName);
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.foto_url);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [editNama, setEditNama] = useState(profile.nama);
  const [editUsername, setEditUsername] = useState(profile.username);
  const [editNomorWa, setEditNomorWa] = useState(profile.nomor_wa || '');
  const [editBio, setEditBio] = useState(profile.bio || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    window.setTimeout(() => setFeedback(null), 5000);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !isImageFile(file)) return;
    setIsAvatarDialogOpen(false);

    startTransition(async () => {
      try {
        const uploadFile = await convertHeicToJpeg(file);
        if (uploadFile.size > 10 * 1024 * 1024) return showFeedback('error', 'Ukuran foto maksimal 10MB.');

        const previewUrl = URL.createObjectURL(uploadFile);
        setAvatarUrl(previewUrl);
        setStoreAvatarUrl(previewUrl);
        window.dispatchEvent(new CustomEvent('user-avatar-updated', { detail: { url: previewUrl } }));

        const formData = new FormData();
        formData.append('avatar', uploadFile);
        const result = await updateAvatar(formData);
        const savedAvatarUrl = result?.url;
        if (result?.error || !savedAvatarUrl) {
          setAvatarUrl(currentProfile.foto_url);
          setStoreAvatarUrl(currentProfile.foto_url);
          window.dispatchEvent(new CustomEvent('user-avatar-updated', { detail: { url: currentProfile.foto_url } }));
          return showFeedback('error', result?.error || 'Gagal memperbarui foto profil.');
        }

        setAvatarUrl(savedAvatarUrl);
        setStoreAvatarUrl(savedAvatarUrl);
        setCurrentProfile((current) => ({ ...current, foto_url: savedAvatarUrl }));
        window.dispatchEvent(new CustomEvent('user-avatar-updated', { detail: { url: savedAvatarUrl } }));
        router.refresh();
        showFeedback('success', 'Foto profil berhasil diperbarui.');
      } catch {
        showFeedback('error', 'File HEIC tidak dapat dikonversi menjadi JPG.');
      }
    });
  };

  const openEditProfile = () => {
    setEditNama(currentProfile.nama);
    setEditUsername(currentProfile.username);
    setEditNomorWa(currentProfile.nomor_wa || '');
    setEditBio(currentProfile.bio || '');
    setFormError(null);
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nama = editNama.trim();
    const username = editUsername.trim().toLowerCase();
    if (nama.length < 2) return setFormError('Nama lengkap wajib diisi minimal 2 karakter.');
    if (!/^[a-zA-Z0-9_.]{3,30}$/.test(username)) return setFormError('Username hanya boleh berisi huruf, angka, titik, atau underscore (3–30 karakter).');

    setFormError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append('nama', nama);
      formData.append('username', username);
      formData.append('nomor_wa', editNomorWa.trim());
      formData.append('bio', editBio.trim());
      const result = await updateMyProfile(formData);
      if (result?.error) return setFormError(result.error);

      setCurrentProfile((current) => ({ ...current, nama, username, nomor_wa: editNomorWa.trim(), bio: editBio.trim() || null }));
      setStoreUserName(nama);
      setIsEditProfileOpen(false);
      router.refresh();
      showFeedback('success', result?.message || 'Profil akun berhasil diperbarui.');
    });
  };

  const handleChangePassword = () => {
    if (newPassword.length < 6) return setFormError('Kata sandi baru minimal 6 karakter.');
    if (newPassword !== confirmPassword) return setFormError('Konfirmasi kata sandi tidak cocok.');

    setFormError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append('newPassword', newPassword);
      const result = await changePassword(formData);
      if (result?.error) return setFormError(result.error);

      setNewPassword('');
      setConfirmPassword('');
      setIsPasswordDialogOpen(false);
      showFeedback('success', 'Kata sandi akun berhasil diperbarui.');
    });
  };

  const roleLabel = ROLE_LABELS[currentProfile.role] || currentProfile.role;
  const accountDetails = [
    { icon: Mail, label: 'Email', value: currentProfile.email || 'Belum tersedia' },
    { icon: Phone, label: 'WhatsApp', value: currentProfile.nomor_wa || 'Belum diatur' },
    { icon: Building2, label: 'Bagian / divisi', value: currentProfile.bagian?.nama || 'Belum ditetapkan' },
    { icon: UserRound, label: 'Bergabung', value: formatJoinedDate(currentProfile.created_at) },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {feedback && <div className={cn('flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium animate-in fade-in slide-in-from-top-2', feedback.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'border-destructive/30 bg-destructive/10 text-destructive')}>{feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}{feedback.message}</div>}

      <Card className="overflow-hidden bg-gradient-to-br from-card via-card to-muted/30">
        <CardHeader className="border-b border-border/60 p-4 pb-3 sm:p-5 sm:pb-3"><CardTitle>Data akun</CardTitle><CardDescription>Informasi identitas akun yang sedang digunakan.</CardDescription></CardHeader>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-4 text-left sm:gap-5">
            <div className="relative shrink-0">
              <Avatar className="h-20 w-20 border-2 border-primary/25 shadow-sm sm:h-24 sm:w-24"><AvatarImage src={avatarUrl || undefined} alt={`Foto profil ${currentProfile.nama}`} /><AvatarFallback className="bg-primary/10 text-xl font-bold text-primary sm:text-2xl">{getInitials(currentProfile.nama)}</AvatarFallback></Avatar>
              <button type="button" onClick={() => setIsAvatarDialogOpen(true)} disabled={isPending} className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40" aria-label="Ubah foto profil">{isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}</button>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><h2 className="truncate text-lg font-bold sm:text-xl">{currentProfile.nama}</h2><p className="text-xs text-muted-foreground sm:text-sm">@{currentProfile.username}</p></div><Badge variant={currentProfile.role === 'admin' ? 'default' : currentProfile.role === 'ketua' ? 'destructive' : 'secondary'} className="w-fit gap-1 px-2 py-0.5 text-[11px]"><Shield className="h-3 w-3" />{roleLabel}</Badge></div>
              {currentProfile.bio && <p className="mt-2 line-clamp-2 max-w-2xl text-xs italic text-muted-foreground sm:text-sm">&ldquo;{currentProfile.bio}&rdquo;</p>}
              <dl className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">{accountDetails.map(({ icon: Icon, label, value }) => <div key={label} className="min-w-0 rounded-lg border border-border/60 bg-background/45 p-2.5 sm:p-3"><dt className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground"><Icon className="h-3 w-3 text-primary" />{label}</dt><dd className="mt-0.5 truncate text-xs font-medium text-foreground sm:text-sm">{value}</dd></div>)}</dl>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-3 sm:p-5 sm:pb-3"><CardTitle>Aksi akun</CardTitle><CardDescription>Perbarui profil, keamanan, atau akhiri sesi Anda.</CardDescription></CardHeader>
        <CardContent className="grid gap-2 p-4 pt-0 sm:grid-cols-2 sm:gap-3 sm:p-5 sm:pt-0 lg:grid-cols-3">
          <Button type="button" variant="outline" onClick={openEditProfile} className="h-auto min-h-16 justify-start gap-3 whitespace-normal px-3 py-2.5 text-left sm:min-h-20 sm:px-4 sm:py-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-9 sm:w-9"><UserPen className="h-4 w-4" /></span><span><span className="block text-sm">Edit Profil</span><span className="mt-0.5 block text-[11px] font-normal text-muted-foreground sm:text-xs">Nama, username, kontak, dan bio</span></span></Button>
          <Button type="button" variant="outline" onClick={() => { setFormError(null); setIsPasswordDialogOpen(true); }} className="h-auto min-h-16 justify-start gap-3 whitespace-normal px-3 py-2.5 text-left sm:min-h-20 sm:px-4 sm:py-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 sm:h-9 sm:w-9"><KeyRound className="h-4 w-4" /></span><span><span className="block text-sm">Ganti Password</span><span className="mt-0.5 block text-[11px] font-normal text-muted-foreground sm:text-xs">Perbarui keamanan akses akun</span></span></Button>
          <LogoutButton variant="outline" text="Keluar dari Akun" description="Akhiri sesi pada perangkat ini" className="h-auto min-h-16 justify-start gap-3 whitespace-normal px-3 py-2.5 text-left sm:min-h-20 sm:px-4 sm:py-3" />
          <ThemeToggle showLabel />
          <ColorThemeSwitcher compact showDivider={false} label="Tema warna" />
        </CardContent>
      </Card>

      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}><DialogContent className="w-[calc(100vw-2rem)] max-w-sm"><DialogHeader><DialogTitle>Ubah foto profil</DialogTitle><DialogDescription>Gunakan gambar JPG, PNG, WebP, atau HEIC dengan ukuran maksimal 10MB.</DialogDescription></DialogHeader><label htmlFor="profile-avatar-upload" className="flex min-h-20 cursor-pointer items-center gap-3 rounded-lg border border-dashed border-primary/30 px-4 text-sm font-medium transition-colors hover:bg-muted"><Upload className="h-5 w-5 text-primary" />Pilih foto dari perangkat</label><input id="profile-avatar-upload" type="file" accept="image/*,.heic,.heif" className="sr-only" onChange={handleAvatarChange} disabled={isPending} /></DialogContent></Dialog>

      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}><DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto"><DialogHeader><DialogTitle>Edit profil</DialogTitle><DialogDescription>Perbarui informasi pribadi yang ditampilkan di akun Anda.</DialogDescription></DialogHeader><form onSubmit={handleSaveProfile} className="space-y-4">{formError && <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{formError}</p>}<div className="space-y-1.5"><Label htmlFor="profile-name">Nama lengkap</Label><Input id="profile-name" value={editNama} onChange={(event) => setEditNama(event.target.value)} required /></div><div className="space-y-1.5"><Label htmlFor="profile-username">Username</Label><div className="relative"><span className="absolute left-3 top-2.5 text-sm text-muted-foreground">@</span><Input id="profile-username" value={editUsername} onChange={(event) => setEditUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))} className="pl-7" required /></div></div><div className="space-y-1.5"><Label htmlFor="profile-whatsapp">Nomor WhatsApp</Label><Input id="profile-whatsapp" value={editNomorWa} onChange={(event) => setEditNomorWa(event.target.value)} placeholder="081234567890" /></div><div className="space-y-1.5"><Label htmlFor="profile-bio">Bio singkat</Label><Textarea id="profile-bio" value={editBio} onChange={(event) => setEditBio(event.target.value)} maxLength={200} rows={3} placeholder="Ceritakan peran Anda di organisasi" /></div><DialogFooter className="gap-2 sm:gap-0"><Button type="button" variant="outline" onClick={() => setIsEditProfileOpen(false)} disabled={isPending}>Batal</Button><Button type="submit" loading={isPending}>Simpan Perubahan</Button></DialogFooter></form></DialogContent></Dialog>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}><DialogContent className="w-[calc(100vw-2rem)] max-w-sm"><DialogHeader><DialogTitle>Ganti password</DialogTitle><DialogDescription>Gunakan setidaknya 6 karakter untuk kata sandi baru Anda.</DialogDescription></DialogHeader><div className="space-y-4">{formError && <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{formError}</p>}<div className="space-y-1.5"><Label htmlFor="new-password">Password baru</Label><Input id="new-password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></div><div className="space-y-1.5"><Label htmlFor="confirm-password">Konfirmasi password</Label><Input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></div></div><DialogFooter className="gap-2 sm:gap-0"><Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)} disabled={isPending}>Batal</Button><Button onClick={handleChangePassword} loading={isPending}>Ubah Password</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
