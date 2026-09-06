"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import {
  Shield,
  Camera,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Sparkles,
  KeyRound,
  AlertCircle,
  Loader2,
  Users,
  Search,
  Building2,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { updateAvatar, changePassword } from "@/actions/profil";
import { useAuthStore } from "@/store/auth-store";

interface ProfileData {
  id: string;
  nama: string;
  username: string;
  foto_url: string | null;
  bio: string | null;
  role: "admin" | "ketua" | "anggota";
  created_at: string;
  email?: string;
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
  admin: "Administrator",
  ketua: "Ketua Karang Taruna",
  anggota: "Anggota",
};

export function ProfilManager({ profile, users = [] }: ProfilManagerProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.foto_url);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const setStoreAvatarUrl = useAuthStore((s) => s.setAvatarUrl);

  // Search & Filter state for member table
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBagian, setFilterBagian] = useState<string>("semua");
  const [filterRole, setFilterRole] = useState<string>("semua");

  // Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const clearFeedback = () => {
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setAvatarUrl(localUrl);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await updateAvatar(formData);
      if (res?.error) {
        setFeedback({ type: "error", message: res.error });
        setAvatarUrl(profile.foto_url);
      } else if (res?.url) {
        setAvatarUrl(res.url);
        setStoreAvatarUrl(res.url);
        setFeedback({ type: "success", message: "Foto profil berhasil diperbarui!" });
      }
      clearFeedback();
    });
  };

  const handleSavePassword = () => {
    setPasswordError(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Kata sandi baru minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("newPassword", newPassword);

      const res = await changePassword(formData);
      if (res?.error) {
        setPasswordError(res.error);
      } else {
        setIsPasswordModalOpen(false);
        setNewPassword("");
        setConfirmPassword("");
        setFeedback({ type: "success", message: "Kata sandi berhasil diperbarui!" });
        clearFeedback();
      }
    });
  };

  const roleLabel = ROLE_LABELS[profile.role] || profile.role;

  // Extract unique departments for filter dropdown
  const uniqueBagian = Array.from(
    new Map(
      users
        .filter((u) => u.bagian?.id)
        .map((u) => [u.bagian!.id, u.bagian!.nama])
    ).entries()
  );

  // Filtered members list
  const filteredUsers = users.filter((u) => {
    if (filterRole !== "semua" && u.role !== filterRole) return false;
    if (filterBagian !== "semua" && u.bagian_id !== filterBagian) return false;

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
          <p className="text-sm text-muted-foreground mt-1">
            Informasi akun pengguna dan direktori seluruh anggota organisasi yang tersinkronisasi terpusat dari Manajemen Pengguna.
          </p>
        </div>
        {profile.role === "admin" && (
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
          className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-2 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-destructive/10 border border-destructive/30 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
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
                  <img
                    src={avatarUrl}
                    alt="Foto Profil"
                    className="aspect-square h-full w-full object-cover"
                  />
                ) : (
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {profile.nama.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <label
                htmlFor="photo-upload"
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors cursor-pointer"
                title="Perbarui Foto Profil"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isPending}
                />
              </label>
            </div>

            {/* Info detail (read-only) */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{profile.nama}</h2>
                  <p className="text-xs text-muted-foreground">@{profile.username}</p>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5">
                  <Badge
                    variant={
                      profile.role === "admin"
                        ? "default"
                        : profile.role === "ketua"
                        ? "destructive"
                        : "secondary"
                    }
                    className="gap-1 text-xs py-0.5 px-2.5"
                  >
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

              {profile.bio && (
                <p className="text-xs text-muted-foreground italic max-w-2xl">
                  "{profile.bio}"
                </p>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  <span>{profile.email || "Email Terdaftar"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>
                    Bergabung {new Date(profile.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Akun Terverifikasi</span>
                </span>
              </div>
            </div>

            {/* Quick Action */}
            <div className="shrink-0 flex sm:flex-col gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8 flex-1 sm:flex-initial"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Ganti Sandi</span>
              </Button>
              <Link href="/struktur" className="flex-1 sm:flex-initial">
                <Button variant="ghost" size="sm" className="w-full gap-1.5 text-xs h-8 text-muted-foreground">
                  <span>Lihat Bagan</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table Section: Synchronized Members Table */}
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
              <CardDescription className="text-xs mt-0.5">
                Daftar anggota resmi yang tersinkronisasi otomatis dari pembuatan akun di Manajemen Pengguna.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[11px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 bg-emerald-500/5">
                <CheckCircle2 className="h-3 w-3" />
                <span>Sinkron Real-time</span>
              </Badge>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="pt-3 flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari nama anggota, username, atau bagian..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-background"
              />
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
                  <div key={u.id} className="p-3.5 space-y-2 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-9 w-9 shrink-0 border border-border/60">
                          <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                            {u.nama?.slice(0, 2).toUpperCase() || "KT"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs sm:text-sm text-foreground truncate">{u.nama}</p>
                          <p className="text-[11px] text-muted-foreground truncate">@{u.username}</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          u.role === "admin"
                            ? "default"
                            : u.role === "ketua"
                            ? "destructive"
                            : "secondary"
                        }
                        className="capitalize text-[10px] py-0 px-2 shrink-0"
                      >
                        {u.role}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                      <span>Bagian: <strong className="text-foreground">{u.bagian?.nama || "Umum"}</strong></span>
                      <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                        Aktif
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10">
                      <TableHead className="w-[60px]"></TableHead>
                      <TableHead>Nama Anggota</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Bagian / Departemen</TableHead>
                      <TableHead>Role / Akses</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Tgl Bergabung</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id} className="hover:bg-muted/20">
                        <TableCell className="py-2.5">
                          <Avatar className="h-8 w-8 border border-border/60">
                            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                              {u.nama?.slice(0, 2).toUpperCase() || "KT"}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium text-xs sm:text-sm">{u.nama}</TableCell>
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
                          <Badge
                            variant={
                              u.role === "admin"
                                ? "default"
                                : u.role === "ketua"
                                ? "destructive"
                                : "secondary"
                            }
                            className="capitalize text-xs font-medium"
                          >
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
                            ? new Date(u.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
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

      {/* Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="max-w-sm w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>Ganti Kata Sandi Akun</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tentukan kata sandi baru untuk keamanan akses akun Anda.
            </DialogDescription>
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
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Konfirmasi Kata Sandi Baru</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang kata sandi baru"
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsPasswordModalOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleSavePassword}
              disabled={!newPassword || !confirmPassword || isPending}
            >
              {isPending ? "Memproses..." : "Ubah Sandi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
