"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Bell,
  Lock,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  KeyRound,
} from "lucide-react";

export function ProfilManager() {
  const [nama, setNama] = useState("Azzam Azhari");
  const [username, setUsername] = useState("azzam_azhari");
  const [email, setEmail] = useState("azzam.azhari@karangtaruna.id");
  const [phone, setPhone] = useState("0812-3456-7890");
  const [rt, setRt] = useState("RT 03 / RW 05");
  const [bio, setBio] = useState("Ketua Karang Taruna Masa Bakti 2025–2027 • Bersemangat memajukan kepemudaan.");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Notification toggles
  const [notifMention, setNotifMention] = useState(true);
  const [notifKegiatan, setNotifKegiatan] = useState(true);
  const [notifKas, setNotifKas] = useState(false);

  // Status feedback
  const [isSaved, setIsSaved] = useState(false);

  // Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordChangedAlert, setPasswordChangedAlert] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleSavePassword = () => {
    if (!oldPassword || !newPassword) return;
    setIsPasswordModalOpen(false);
    setOldPassword("");
    setNewPassword("");
    setPasswordChangedAlert(true);
    setTimeout(() => setPasswordChangedAlert(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profil Pengguna</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola identitas akun, informasi kontak, preferensi pemberitahuan, dan rekam jejak kepengurusan.
        </p>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Profil Anda berhasil diperbarui! Perubahan tersimpan secara lokal.</span>
        </div>
      )}

      {passwordChangedAlert && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Kata sandi Anda berhasil diperbarui!</span>
        </div>
      )}

      {/* Mini Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-card/70 border shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground">Kegiatan Diikuti</p>
              <h4 className="text-xl font-bold mt-0.5">14</h4>
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
              <h4 className="text-xl font-bold mt-0.5">8</h4>
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
              <h4 className="text-xl font-bold mt-0.5">12</h4>
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
              <h4 className="text-xl font-bold mt-0.5">3 Agenda</h4>
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
                  <Camera className="h-4 w-4" />
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
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
                  Ketua Karang Taruna
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Pengurus Inti
                </Badge>
              </div>

              <div className="pt-3 border-t text-xs text-muted-foreground space-y-2 text-left">
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate">{email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <span>{phone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>{rt}</span>
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
              <p>Peran & hak akses Anda diatur terpusat oleh Admin melalui menu Manajemen Akses.</p>
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
                <CardTitle className="text-lg">Informasi Pribadi & Kontak</CardTitle>
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
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-xs">Username (@)</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs">Alamat Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs">Nomor WhatsApp</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rt" className="text-xs">Domisili Warga (RT / RW)</Label>
                  <Input
                    id="rt"
                    value={rt}
                    onChange={(e) => setRt(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bio" className="text-xs">Bio / Catatan Pengurus</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="text-xs leading-relaxed"
                  />
                </div>

                {/* Notifications Preferences */}
                <div className="pt-3 border-t space-y-3">
                  <h4 className="text-xs font-semibold flex items-center gap-1.5">
                    <Bell className="h-3.5 w-3.5 text-primary" />
                    <span>Preferensi Notifikasi & Tag</span>
                  </h4>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
                      <div>
                        <p className="text-xs font-medium">Pemberitahuan Mention (@Departemen)</p>
                        <p className="text-[11px] text-muted-foreground">Kirim notifikasi saat bagian Anda ditandai di diskusi.</p>
                      </div>
                      <Switch checked={notifMention} onCheckedChange={setNotifMention} />
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
                      <div>
                        <p className="text-xs font-medium">Pengingat Jadwal Kegiatan</p>
                        <p className="text-[11px] text-muted-foreground">Notifikasi H-1 sebelum agenda atau event terlaksana.</p>
                      </div>
                      <Switch checked={notifKegiatan} onCheckedChange={setNotifKegiatan} />
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
                      <div>
                        <p className="text-xs font-medium">Rekap Laporan Kas Bulanan</p>
                        <p className="text-[11px] text-muted-foreground">Terima ringkasan mutasi kas bendahara tiap awal bulan.</p>
                      </div>
                      <Switch checked={notifKas} onCheckedChange={setNotifKas} />
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-2 border-t py-3">
                <Button type="submit" size="sm" className="px-5 shadow-xs">
                  Simpan Perubahan
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
              Masukkan kata sandi lama dan tentukan kata sandi baru untuk keamanan akun.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Kata Sandi Lama</Label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Kata Sandi Baru</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsPasswordModalOpen(false)}>
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleSavePassword}
              disabled={!oldPassword || !newPassword}
            >
              Ubah Sandi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
