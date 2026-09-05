"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Megaphone,
  Plus,
  Calendar,
  Bell,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Users,
  Building2,
} from "lucide-react";
import {
  PengumumanItem,
  createPengumuman,
  updatePengumuman,
  deletePengumuman,
} from "@/actions/pengumuman";

interface BagianOption {
  id: string;
  nama: string;
  slug: string;
}

interface PengumumanManagerProps {
  initialAnnouncements: PengumumanItem[];
  bagianList: BagianOption[];
  currentUserId?: string;
  userRole?: string;
  currentUserBagianId?: string | null;
}

export function PengumumanManager({
  initialAnnouncements,
  bagianList,
  currentUserId,
  userRole = "anggota",
  currentUserBagianId,
}: PengumumanManagerProps) {
  const [announcements, setAnnouncements] = useState<PengumumanItem[]>(initialAnnouncements);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTarget, setFilterTarget] = useState<"all" | "semua" | "bagian_tertentu">("all");

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PengumumanItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [target, setTarget] = useState<"semua" | "bagian_tertentu">(
    userRole === "admin" || userRole === "ketua" ? "semua" : "bagian_tertentu"
  );
  const [selectedBagianId, setSelectedBagianId] = useState<string>(
    currentUserBagianId || (bagianList.length > 0 ? bagianList[0].id : "")
  );

  const canBroadcastAll = userRole === "admin" || userRole === "ketua";

  const canManageItem = (item: PengumumanItem) => {
    return userRole === "admin" || userRole === "ketua" || item.dibuatOleh === currentUserId;
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setJudul("");
    setIsi("");
    setTarget(canBroadcastAll ? "semua" : "bagian_tertentu");
    setSelectedBagianId(currentUserBagianId || (bagianList.length > 0 ? bagianList[0].id : ""));
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: PengumumanItem) => {
    setEditingItem(item);
    setJudul(item.judul);
    setIsi(item.isi);
    setTarget(item.target);
    setSelectedBagianId(item.bagianId || (bagianList.length > 0 ? bagianList[0].id : ""));
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!judul.trim() || !isi.trim()) {
      setFormError("Judul dan isi pengumuman wajib diisi.");
      return;
    }

    setFormError(null);
    startTransition(async () => {
      if (editingItem) {
        const res = await updatePengumuman(editingItem.id, {
          judul,
          isi,
          target,
          bagianId: target === "bagian_tertentu" ? selectedBagianId : null,
        });

        if (!res.success) {
          setFormError(res.error || "Gagal mengubah pengumuman.");
          return;
        }

        setAnnouncements((prev) =>
          prev.map((item) => {
            if (item.id === editingItem.id) {
              const b = bagianList.find((x) => x.id === selectedBagianId);
              return {
                ...item,
                judul,
                isi,
                target,
                bagianId: target === "bagian_tertentu" ? selectedBagianId : null,
                bagianNama: target === "semua" ? "Semua Anggota" : (b?.nama || "Umum"),
              };
            }
            return item;
          })
        );
        setIsDialogOpen(false);
      } else {
        const res = await createPengumuman({
          judul,
          isi,
          target,
          bagianId: target === "bagian_tertentu" ? selectedBagianId : null,
        });

        if (!res.success || !res.data) {
          setFormError(res.error || "Gagal membuat pengumuman.");
          return;
        }

        setAnnouncements((prev) => [res.data!, ...prev]);
        setIsDialogOpen(false);
      }
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;

    startTransition(async () => {
      const res = await deletePengumuman(deleteId);
      if (res.success) {
        setAnnouncements((prev) => prev.filter((item) => item.id !== deleteId));
        setDeleteId(null);
      } else {
        alert(res.error || "Gagal menghapus pengumuman.");
      }
    });
  };

  const formatDate = (dateIso: string) => {
    try {
      const d = new Date(dateIso);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Hari ini";
    }
  };

  const filteredAnnouncements = announcements.filter((item) => {
    if (filterTarget !== "all" && item.target !== filterTarget) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchJudul = item.judul.toLowerCase().includes(q);
      const matchIsi = item.isi.toLowerCase().includes(q);
      const matchAuthor = item.authorName.toLowerCase().includes(q);
      const matchBagian = (item.bagianNama || "").toLowerCase().includes(q);
      if (!matchJudul && !matchIsi && !matchAuthor && !matchBagian) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pengumuman & Broadcast Internal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pemberitahuan resmi satu arah untuk seluruh pengurus atau divisi tertentu.
          </p>
        </div>
        <Button size="sm" className="gap-2 w-full sm:w-auto text-xs h-8" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          <span>Buat Pengumuman</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border rounded-xl p-3 shadow-xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Button
            size="sm"
            variant={filterTarget === "all" ? "default" : "ghost"}
            className="text-xs h-8 px-3 rounded-lg"
            onClick={() => setFilterTarget("all")}
          >
            Semua ({announcements.length})
          </Button>
          <Button
            size="sm"
            variant={filterTarget === "semua" ? "default" : "ghost"}
            className="text-xs h-8 px-3 rounded-lg gap-1.5"
            onClick={() => setFilterTarget("semua")}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Semua Anggota ({announcements.filter((a) => a.target === "semua").length})</span>
          </Button>
          <Button
            size="sm"
            variant={filterTarget === "bagian_tertentu" ? "default" : "ghost"}
            className="text-xs h-8 px-3 rounded-lg gap-1.5"
            onClick={() => setFilterTarget("bagian_tertentu")}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Bagian Tertentu ({announcements.filter((a) => a.target === "bagian_tertentu").length})</span>
          </Button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Cari judul atau isi pengumuman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-muted/30 w-full"
          />
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <Card className="border-dashed py-12 text-center">
            <CardContent className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                <Megaphone className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold">Belum Ada Pengumuman</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Buat siaran informasi baru untuk memberi kabar penting ke seluruh anggota atau seksi organisasi.
              </p>
              <Button size="sm" onClick={handleOpenCreate} className="mt-2 text-xs">
                Buat Pengumuman Sekarang
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredAnnouncements.map((item) => (
            <Card key={item.id} className="hover:shadow-sm transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                      <Bell className="h-4 w-4" />
                    </div>
                    <Badge variant={item.target === "semua" ? "default" : "secondary"} className="text-xs">
                      {item.target === "semua" ? "Semua Anggota" : `Bagian: ${item.bagianNama || "Tertentu"}`}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(item.createdAt)}
                    </span>

                    {canManageItem(item) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEdit(item)}>
                            <Edit className="h-3.5 w-3.5 mr-2" />
                            <span>Edit Pengumuman</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(item.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            <span>Hapus</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                <CardTitle className="text-base sm:text-lg mt-2">{item.judul}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {item.isi}
                </p>
                <div className="mt-4 pt-3 border-t text-xs text-muted-foreground flex items-center justify-between">
                  <span>
                    Diumumkan oleh: <strong className="text-foreground">{item.authorName}</strong> ({item.authorRole})
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Megaphone className="h-5 w-5 text-amber-500" />
              <span>{editingItem ? "Edit Pengumuman" : "Buat Pengumuman Baru"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Pesan ini bersifat broadcast satu arah untuk pemberitahuan resmi.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="p-2.5 text-xs bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Target Penerima</Label>
              <Select
                value={target}
                onValueChange={(val: "semua" | "bagian_tertentu") => setTarget(val)}
                disabled={!canBroadcastAll}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Anggota (Broadcast Terbuka)</SelectItem>
                  <SelectItem value="bagian_tertentu">Bagian Tertentu Saja</SelectItem>
                </SelectContent>
              </Select>
              {!canBroadcastAll && (
                <p className="text-[11px] text-muted-foreground">
                  *Sebagai anggota bagian, pengumuman otomatis ditujukan ke bagian Anda.
                </p>
              )}
            </div>

            {target === "bagian_tertentu" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Pilih Bagian Penerima</Label>
                <Select value={selectedBagianId} onValueChange={setSelectedBagianId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Pilih Bagian" />
                  </SelectTrigger>
                  <SelectContent>
                    {bagianList.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Judul Pengumuman</Label>
              <Input
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Contoh: Pemberitahuan Rapat Kerja Bakti Minggu Ini"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Isi Pengumuman</Label>
              <Textarea
                value={isi}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setIsi(e.target.value)}
                rows={5}
                placeholder="Tuliskan isi pengumuman lengkap, tanggal, tempat, atau instruksi..."
                className="text-xs leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isPending || !judul.trim() || !isi.trim()}>
              {isPending && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
              <span>{editingItem ? "Simpan Perubahan" : "Terbitkan Pengumuman"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Konfirmasi Hapus Pengumuman</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus pengumuman ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)} disabled={isPending}>
              Batal
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
              {isPending && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
              <span>Hapus Permanen</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
