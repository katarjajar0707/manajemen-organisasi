"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  UserCheck,
  CheckCircle2,
  Calendar,
  FileText,
  MessagesSquare,
  Lock,
  Mail,
  Sparkles,
  KeyRound,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { updateProfile, updateAvatar, changePassword } from "@/actions/profil";

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

interface ProfilManagerProps {
  profile: ProfileData;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  ketua: "Ketua Karang Taruna",
  anggota: "Anggota",
};

export function ProfilManager({ profile }: ProfilManagerProps) {
  const [nama, setNama] = useState(profile.nama);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.foto_url);

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const clearFeedback = () => {
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("nama", nama);
      formData.append("username", username);
      formData.append("bio", bio);

      const res = await updateProfile(formData);
      if (res?.error) {
        setFeedback({ type: "error", message: res.error });
      } else {
        setFeedback({ type: "success", message: "Profil berhasil diperbarui!" });
      }
      clearFeedback();
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Tampilkan preview lokal segera
    const localUrl = URL.createObjectURL(file);
    setAvatarUrl(localUrl);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await updateAvatar(formData);
      if (res?.error) {
        setFeedback({ type: "error", message: res.error });
        setAvatarUrl(profile.foto_url); // Revert
      } else if (res?.url) {
        setAvatarUrl(res.url);
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

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profil Pengguna</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola identitas akun, informasi kontak, dan keamanan akun.
        </p>
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

      {/* Mini Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-card/70 border shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground">Kegiatan Diikuti</p>
              <h4 className="text-xl font-bold mt-0.5">—</h4>
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground">Topik & Diskusi</p>
              <h4 className="text-xl font-bold mt-0.5">—</h4>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <MessagesSquare className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground">Arsip Diunggah</p>
              <h4 className="text-xl font-bold mt-0.5">—</h4>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground">Penugasan Aktif</p>
              <h4 className="text-xl font-bold mt-0.5">—</h4>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Summary */}
        <div className="space-y-6">
          <Card className="border shadow-xs text-center">
            <CardContent className="pt-6 pb-5 space-y-4">
              <div className="relative mx-auto w-24 h-24 group">
                <Avatar className="h-24 w-24 border-2 border-primary/30 mx-auto">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="Foto Profil"
                      className="aspect-square h-full w-full object-cover"
                    />
                  ) : (
                    <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                      {nama.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <label
                  htmlFor="photo-upload"
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors cursor-pointer"
                  title="Ubah Foto"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
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

              <div>
                <h3 className="font-bold text-base text-foreground">{nama}</h3>
                <p className="text-xs text-muted-foreground">@{username}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 justify-center">
                <Badge variant="default" className="gap-1 text-xs">
                  <Shield className="h-3 w-3" />
                  {roleLabel}
                </Badge>
                {profile.bagian && (
                  <Badge variant="secondary" className="text-xs">
                    {profile.bagian.nama}
                  </Badge>
                )}
              </div>

              <div className="pt-3 border-t text-xs text-muted-foreground space-y-2 text-left">
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate">{profile.email || "—"}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>Bergabung sejak {new Date(profile.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</span>
                </p>
              </div>
            </CardContent>

            <CardFooter className="pt-0 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs gap-1.5"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Ganti Kata Sandi</span>
              </Button>
              <Link href="/struktur" className="w-full">
                <Button variant="ghost" size="sm" className="w-full text-xs gap-1 text-muted-foreground">
                  <span>Lihat Penugasan Bagan</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Quick Security Badge */}
          <Card className="border shadow-xs bg-muted/20">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                <span>Status Keamanan Akun</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground space-y-2">
              <p>Peran &amp; hak akses Anda diatur terpusat oleh Admin. Role Anda bersifat <strong>read-only</strong>.</p>
              <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                Akses Terverifikasi Penuh
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Form Settings */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave}>
            <Card className="border shadow-xs">
              <CardHeader>
                <CardTitle className="text-lg">Informasi Pribadi</CardTitle>
                <CardDescription className="text-xs">
                  Data ini digunakan oleh sesama pengurus untuk keperluan komunikasi dan koordinasi kepanitiaan.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="nama" className="text-xs">Nama Lengkap</Label>
                    <Input
                      id="nama"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      className="text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-xs">Username (@)</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs">Alamat Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email || ""}
                      className="text-xs bg-muted/50"
                      disabled
                    />
                    <p className="text-[10px] text-muted-foreground">Email dikelola oleh sistem autentikasi.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="role" className="text-xs">Peran (Role)</Label>
                    <Input
                      id="role"
                      value={roleLabel}
                      className="text-xs bg-muted/50"
                      disabled
                    />
                    <p className="text-[10px] text-muted-foreground">Hanya Admin yang dapat mengubah role.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bio" className="text-xs">Bio / Catatan Pengurus</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="text-xs leading-relaxed"
                    placeholder="Tulis sesuatu tentang diri Anda..."
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-2 border-t py-3">
                <Button type="submit" size="sm" className="px-5 shadow-xs" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>

      {/* Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="max-w-sm w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>Ganti Kata Sandi</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tentukan kata sandi baru untuk keamanan akun Anda.
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
