'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Camera, ArrowRight, CheckCircle2, Lock, Mail, KeyRound, AlertCircle, Loader2, Users, Search, Building2, ShieldCheck, Phone, UserPen, Eye } from 'lucide-react';
import { updateAvatar, changePassword, updateMyProfile } from '@/actions/profil';
import { useAuthStore } from '@/store/auth-store';

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
  bagian?: {
    id: string;
    nama: string;
    slug: string;
  } | null;
}

export interface UserItem {
  id: string;
  nama: string;
  username: string;
  foto_url?: string | null;
  role: string;
  bagian_id: string | null;
  created_at?: string;
  bagian?: {
    id: string;
    nama: string;
  } | null;
}

interface ProfilManagerProps {
  profile: ProfileData;
  users?: UserItem[];
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  ketua: 'Ketua Karang Taruna',
  anggota: 'Anggota',
};

export function ProfilManager({ profile, users = [] }: ProfilManagerProps) {
  // Personal profile local states
  const [currentNama, setCurrentNama] = useState(profile.nama);
  const [currentUsername, setCurrentUsername] = useState(profile.username);
  const [currentNomorWa, setCurrentNomorWa] = useState(profile.nomor_wa || '');
  const [currentBio, setCurrentBio] = useState(profile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.foto_url);

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const router = useRouter();
  const setStoreAvatarUrl = useAuthStore((s) => s.setAvatarUrl);
  const setStoreUserName = useAuthStore((s) => s.setUserName);

  // Search & Filter state for member table
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBagian, setFilterBagian] = useState<string>('semua');
  const [filterRole, setFilterRole] = useState<string>('semua');
  const [previewMember, setPreviewMember] = useState<UserItem | null>(null);

  // Edit Profile Modal states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editNama, setEditNama] = useState(profile.nama);
  const [editUsername, setEditUsername] = useState(profile.username);
  const [editNomorWa, setEditNomorWa] = useState(profile.nomor_wa || '');
  const [editBio, setEditBio] = useState(profile.bio || '');
  const [editPassword, setEditPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  // Quick Password Modal states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const clearFeedback = () => {
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setAvatarUrl(localUrl);
    setStoreAvatarUrl(localUrl);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-avatar-updated', { detail: { url: localUrl } }));
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await updateAvatar(formData);
      if (res?.error) {
        setFeedback({ type: 'error', message: res.error });
        setAvatarUrl(profile.foto_url);
        setStoreAvatarUrl(profile.foto_url);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('user-avatar-updated', { detail: { url: profile.foto_url } }));
        }
      } else if (res?.url) {
        setAvatarUrl(res.url);
        setStoreAvatarUrl(res.url);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('user-avatar-updated', { detail: { url: res.url } }));
        }
        router.refresh();
        setFeedback({ type: 'success', message: 'Foto profil berhasil diperbarui!' });
      }
      clearFeedback();
    });
  };

  const handleOpenEditProfile = () => {
    setEditNama(currentNama);
    setEditUsername(currentUsername);
    setEditNomorWa(currentNomorWa);
    setEditBio(currentBio);
    setEditPassword('');
    setEditConfirmPassword('');
    setEditError(null);
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    // Validasi client-side
    if (!editNama.trim() || editNama.trim().length < 2) {
      setEditError('Nama lengkap wajib diisi minimal 2 karakter.');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_.]{3,30}$/;
    if (!usernameRegex.test(editUsername.trim())) {
      setEditError('Username hanya boleh berisi huruf, angka, titik, atau underscore (3-30 karakter).');
      return;
    }

    if (editNomorWa.trim()) {
      const phoneRegex = /^[0-9+\s\-]{8,20}$/;
      if (!phoneRegex.test(editNomorWa.trim())) {
        setEditError('Format nomor WhatsApp tidak valid. Contoh: 081234567890 atau +6281234567890.');
        return;
      }
    }

    if (editPassword) {
      if (editPassword.length < 6) {
        setEditError('Kata sandi baru minimal 6 karakter.');
        return;
      }
      if (editPassword !== editConfirmPassword) {
        setEditError('Konfirmasi kata sandi baru tidak sesuai.');
        return;
      }
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('nama', editNama.trim());
      formData.append('username', editUsername.trim());
      formData.append('nomor_wa', editNomorWa.trim());
      formData.append('bio', editBio.trim());
      if (editPassword) {
        formData.append('newPassword', editPassword);
        formData.append('confirmPassword', editConfirmPassword);
      }

      const res = await updateMyProfile(formData);
      if (res?.error) {
        setEditError(res.error);
      } else {
        setCurrentNama(editNama.trim());
        setCurrentUsername(editUsername.trim().toLowerCase());
        setCurrentNomorWa(editNomorWa.trim());
        setCurrentBio(editBio.trim());
        setEditPassword('');
        setEditConfirmPassword('');
        setIsEditProfileOpen(false);
        setStoreUserName(editNama.trim());
        router.refresh();
        setFeedback({
          type: 'success',
          message: res?.message || 'Profil akun Anda berhasil diperbarui!',
        });
        clearFeedback();
      }
    });
  };

  const handleSavePassword = () => {
    setPasswordError(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('newPassword', newPassword);

      const res = await changePassword(formData);
      if (res?.error) {
        setPasswordError(res.error);
      } else {
        setIsPasswordModalOpen(false);
        setNewPassword('');
        setConfirmPassword('');
        setFeedback({ type: 'success', message: 'Kata sandi akun berhasil diperbarui!' });
        clearFeedback();
      }
    });
  };

  const roleLabel = ROLE_LABELS[profile.role] || profile.role;

  // Extract unique departments for filter dropdown
  const uniqueBagian = Array.from(new Map(users.filter((u) => u.bagian?.id).map((u) => [u.bagian!.id, u.bagian!.nama])).entries());

  // Filtered members list
  const filteredUsers = users.filter((u) => {
    if (filterRole !== 'semua' && u.role !== filterRole) return false;
    if (filterBagian !== 'semua' && u.bagian_id !== filterBagian) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNama = u.nama?.toLowerCase().includes(q);
      const matchUsername = u.username?.toLowerCase().includes(q);
      const matchBagian = u.bagian?.nama?.toLowerCase().includes(q);
      const matchRole = u.role?.toLowerCase().includes(q);
      if (!matchNama && !matchUsername && !matchBagian && !matchRole) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profil &amp; Direktori Anggota</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola profil identitas akun pribadi Anda dan lihat direktori resmi seluruh anggota organisasi.</p>
        </div>
        {profile.role === 'admin' && (
          <Link href="/pengguna">
            <Button size="sm" className="gap-2 text-xs h-9 shadow-xs">
              <ShieldCheck className="h-4 w-4" />
              <span>Kelola di Manajemen Pengguna</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-top-2 ${
            feedback.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-destructive/10 border border-destructive/30 text-destructive'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Top Section: Personal Identity Overview */}
      <Card className="border shadow-xs overflow-hidden bg-gradient-to-r from-card via-card to-muted/20">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar with upload button */}
            <div className="relative shrink-0">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-primary/30 shadow-xs">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Foto Profil" className="aspect-square h-full w-full object-cover" />
                ) : (
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">{currentNama.slice(0, 2).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <label htmlFor="photo-upload" className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors cursor-pointer" title="Perbarui Foto Profil">
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                <input id="photo-upload" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleAvatarChange} disabled={isPending} />
              </label>
            </div>

            {/* Info detail */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{currentNama}</h2>
                  <p className="text-xs text-muted-foreground">@{currentUsername}</p>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5">
                  <Badge variant={profile.role === 'admin' ? 'default' : profile.role === 'ketua' ? 'destructive' : 'secondary'} className="gap-1 text-xs py-0.5 px-2.5">
                    <Shield className="h-3 w-3" />
                    <span>{roleLabel}</span>
                  </Badge>
                  {profile.bagian && (
                    <Badge variant="outline" className="text-xs py-0.5 px-2.5 gap-1 border-primary/30 text-primary">
                      <Building2 className="h-3 w-3" />
                      <span>{profile.bagian.nama}</span>
                    </Badge>
                  )}
                </div>
              </div>

              {currentBio && <p className="text-xs text-muted-foreground italic max-w-2xl">"{currentBio}"</p>}

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  <span>{profile.email || 'Email Terdaftar'}</span>
                </span>

                {currentNomorWa ? (
                  <a
                    href={`https://wa.me/${currentNomorWa.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                    title="Buka Chat WhatsApp"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>WA: {currentNomorWa}</span>
                  </a>
                ) : (
                  <span className="flex items-center gap-1.5 text-muted-foreground/70">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>
                      WA: <em>Belum diatur</em>
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions (Tersedia untuk setiap role: Admin, Ketua, Anggota) */}
            <div className="shrink-0 flex sm:flex-col gap-2 w-full sm:w-auto">
              <Button variant="default" size="sm" className="gap-1.5 text-xs h-8 flex-1 sm:flex-initial shadow-xs" onClick={handleOpenEditProfile}>
                <UserPen className="h-3.5 w-3.5" />
                <span>Edit Profil Akun</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 flex-1 sm:flex-initial" onClick={() => setIsPasswordModalOpen(true)}>
                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Ganti Sandi</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table Section: Synchronized Members Table (Read-Only untuk Ketua & Anggota) */}
      <Card className="border shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Tabel Anggota Organisasi</span>
                <Badge variant="secondary" className="text-xs font-normal">
                  {filteredUsers.length} Anggota
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">Direktori seluruh akun anggota organisasi. Hanya Administrator yang memiliki hak mengelola akun pengguna lain.</CardDescription>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="pt-3 flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Cari nama anggota, username, atau bagian..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 text-xs bg-background" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {uniqueBagian.length > 0 && (
                <Select value={filterBagian} onValueChange={setFilterBagian}>
                  <SelectTrigger className="h-8 text-xs flex-1 sm:w-[140px] bg-background">
                    <SelectValue placeholder="Semua Bagian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Bagian</SelectItem>
                    {uniqueBagian.map(([id, nama]) => (
                      <SelectItem key={id} value={id}>
                        {nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="h-8 text-xs flex-1 sm:w-[120px] bg-background">
                  <SelectValue placeholder="Semua Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Role</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="ketua">Ketua</SelectItem>
                  <SelectItem value="anggota">Anggota</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Tidak ada data anggota yang cocok.</p>
              <p>Coba ubah kata kunci pencarian atau reset filter bagian/role.</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View (< md) */}
              <div className="md:hidden divide-y divide-border/60">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="p-3.5 space-y-2 odd:bg-muted/20 even:bg-background hover:bg-muted/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => setPreviewMember(u)}
                          className="relative group shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40 text-left"
                          title="Klik untuk melihat preview foto profil"
                        >
                          <Avatar className="h-9 w-9 shrink-0 border border-border/60 group-hover:scale-105 transition-transform">
                            {u.foto_url ? <AvatarImage src={u.foto_url} alt={u.nama} className="object-cover" /> : null}
                            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">{u.nama?.slice(0, 2).toUpperCase() || 'KT'}</AvatarFallback>
                          </Avatar>
                        </button>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => setPreviewMember(u)}
                            className="font-semibold text-xs sm:text-sm text-foreground truncate hover:text-primary transition-colors text-left block"
                            title="Klik untuk melihat preview profil"
                          >
                            {u.nama}
                          </button>
                          <p className="text-[11px] text-muted-foreground truncate">@{u.username}</p>
                        </div>
                      </div>
                      <Badge variant={u.role === 'admin' ? 'default' : u.role === 'ketua' ? 'destructive' : 'secondary'} className="capitalize text-[10px] py-0 px-2 shrink-0">
                        {u.role}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                      <span>
                        Bagian: <strong className="text-foreground">{u.bagian?.nama || 'Umum'}</strong>
                      </span>
                      <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                        Aktif
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (>= md) - Read-Only */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10">
                      <TableHead className="w-[60px]">Foto</TableHead>
                      <TableHead>Nama Anggota</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Bagian / Departemen</TableHead>
                      <TableHead>Role / Hak Akses</TableHead>
                      <TableHead>Status Akun</TableHead>
                      <TableHead className="text-right">Tgl Bergabung</TableHead>
                      <TableHead className="text-right w-[60px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id} className="odd:bg-muted/20 even:bg-background hover:bg-muted/40">
                        <TableCell className="py-2.5">
                          <button
                            type="button"
                            onClick={() => setPreviewMember(u)}
                            className="relative group shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40 text-left block"
                            title="Klik untuk melihat preview foto profil"
                          >
                            <Avatar className="h-9 w-9 border border-border/60 group-hover:scale-110 group-hover:ring-2 group-hover:ring-primary/40 transition-all shadow-2xs">
                              {u.foto_url ? <AvatarImage src={u.foto_url} alt={u.nama} className="object-cover" /> : null}
                              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">{u.nama?.slice(0, 2).toUpperCase() || 'KT'}</AvatarFallback>
                            </Avatar>
                          </button>
                        </TableCell>
                        <TableCell className="font-medium text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5">
                            <button type="button" onClick={() => setPreviewMember(u)} className="hover:text-primary transition-colors text-left font-medium" title="Klik untuk melihat preview profil">
                              {u.nama}
                            </button>
                            {u.id === profile.id && (
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-primary/40 text-primary">
                                Anda
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">@{u.username}</TableCell>
                        <TableCell className="text-xs">
                          {u.bagian?.nama ? (
                            <Badge variant="outline" className="text-xs border-border/70 font-normal">
                              {u.bagian.nama}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Umum / Pimpinan</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'admin' ? 'default' : u.role === 'ketua' ? 'destructive' : 'secondary'} className="capitalize text-xs font-medium">
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[11px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5">
                            Aktif
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {u.created_at
                            ? new Date(u.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary" onClick={() => setPreviewMember(u)} title="Lihat Foto & Detail Anggota">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal: Preview Profil Anggota */}
      <Dialog open={!!previewMember} onOpenChange={(open) => !open && setPreviewMember(null)}>
        <DialogContent className="max-w-sm w-[92vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              Profil Anggota
            </DialogTitle>
            <DialogDescription>Informasi akun dan keanggotaan pengguna.</DialogDescription>
          </DialogHeader>

          {previewMember && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2 py-2">
                <Avatar className="aspect-[4/3] h-auto w-full rounded-xl border-2 border-primary/20 bg-muted/40 p-2 shadow-sm">
                  {previewMember.foto_url ? (
                    <AvatarImage src={previewMember.foto_url} alt={previewMember.nama} className="rounded-lg object-cover" />
                  ) : (
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xl">{previewMember.nama?.slice(0, 2).toUpperCase() || 'KT'}</AvatarFallback>
                  )}
                </Avatar>
                <div className="text-center">
                  <h3 className="font-semibold text-base">{previewMember.nama}</h3>
                  <p className="text-xs text-muted-foreground">@{previewMember.username}</p>
                </div>
              </div>

              <div className="space-y-2.5 rounded-lg border bg-muted/20 p-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Role</span>
                  <Badge variant={previewMember.role === 'admin' ? 'default' : previewMember.role === 'ketua' ? 'destructive' : 'secondary'} className="capitalize text-xs">
                    {previewMember.role}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Bagian</span>
                  <span className="font-medium text-right">{previewMember.bagian?.nama || 'Umum / Pimpinan'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    Aktif
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Bergabung</span>
                  <span className="text-right">
                    {previewMember.created_at
                      ? new Date(previewMember.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Edit Profil Akun Sendiri (Admin, Ketua, Anggota) */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
                <UserPen className="h-5 w-5 text-primary" />
                <span>Edit Profil Akun Saya</span>
              </DialogTitle>
              <DialogDescription className="text-xs">Perbarui data akun pribadi Anda. Perubahan akan otomatis disinkronkan ke seluruh sistem dan direktori anggota.</DialogDescription>
            </DialogHeader>

            {editError && (
              <div className="bg-destructive/15 text-destructive text-xs p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <div className="space-y-3.5 py-1">
              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-nama" className="text-xs font-medium">
                  Nama Lengkap <span className="text-destructive">*</span>
                </Label>
                <Input id="edit-nama" value={editNama} onChange={(e) => setEditNama(e.target.value)} placeholder="Nama Lengkap Anda" className="text-xs h-9" required />
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-username" className="text-xs font-medium">
                  Username <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">@</span>
                  <Input id="edit-username" value={editUsername} onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))} placeholder="username" className="text-xs h-9 pl-7" required />
                </div>
                <p className="text-[11px] text-muted-foreground">Hanya huruf kecil, angka, garis bawah (_), atau titik (3-30 karakter).</p>
              </div>

              {/* Nomor WhatsApp */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-nomor-wa" className="text-xs font-medium flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Nomor WhatsApp / HP</span>
                </Label>
                <Input id="edit-nomor-wa" value={editNomorWa} onChange={(e) => setEditNomorWa(e.target.value)} placeholder="Contoh: 081234567890 atau +6281234567890" className="text-xs h-9" />
                <p className="text-[11px] text-muted-foreground">Nomor aktif WhatsApp Anda untuk koordinasi kepengurusan organisasi.</p>
              </div>

              {/* Bio Singkat */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-bio" className="text-xs font-medium">
                  Bio / Catatan Singkat (Opsional)
                </Label>
                <Textarea id="edit-bio" value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Motto atau peran aktif Anda di organisasi..." className="text-xs resize-none" rows={2} maxLength={200} />
              </div>

              {/* Seksi Password Baru (Opsional) */}
              <div className="pt-2 border-t space-y-3">
                <div className="space-y-0.5">
                  <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <Lock className="h-3.5 w-3.5 text-primary" />
                    <span>Ganti Kata Sandi (Opsional)</span>
                  </Label>
                  <p className="text-[11px] text-muted-foreground">Biarkan kosong jika Anda tidak ingin mengubah kata sandi saat ini.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-password" className="text-[11px]">
                      Kata Sandi Baru
                    </Label>
                    <Input id="edit-password" type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Minimal 6 karakter" className="text-xs h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-confirm-password" className="text-[11px]">
                      Konfirmasi Sandi Baru
                    </Label>
                    <Input id="edit-confirm-password" type="password" value={editConfirmPassword} onChange={(e) => setEditConfirmPassword(e.target.value)} placeholder="Ulangi sandi baru" className="text-xs h-8" disabled={!editPassword} />
                  </div>
                </div>
              </div>

              {/* Informasi Terkunci / Read-Only */}
              <div className="pt-2 border-t">
                <div className="bg-muted/40 rounded-lg p-3 text-xs space-y-2 border border-border/50">
                  <p className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
                    <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Informasi Akun (Dikelola oleh Administrator)</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                    <div>
                      <span>Role: </span>
                      <strong className="text-foreground capitalize">{profile.role}</strong>
                    </div>
                    <div>
                      <span>Bagian: </span>
                      <strong className="text-foreground">{profile.bagian?.nama || 'Umum'}</strong>
                    </div>
                    <div>
                      <span>Email: </span>
                      <strong className="text-foreground truncate block">{profile.email || '-'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditProfileOpen(false)} disabled={isPending}>
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={isPending} className="gap-1.5">
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{isPending ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Quick Ganti Password */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="max-w-sm w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>Ganti Kata Sandi Akun</span>
            </DialogTitle>
            <DialogDescription className="text-xs">Tentukan kata sandi baru untuk keamanan akses akun Anda.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {passwordError && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Kata Sandi Baru</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" className="text-xs" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Konfirmasi Kata Sandi Baru</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ketik ulang kata sandi baru" className="text-xs" />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsPasswordModalOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button size="sm" onClick={handleSavePassword} disabled={!newPassword || !confirmPassword || isPending}>
              {isPending ? 'Memproses...' : 'Ubah Sandi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
