"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import {
  Building2,
  Plus,
  ArrowRight,
  FolderKanban,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Users,
  FileText,
  Layers,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import {
  createBagian,
  updateBagian,
  deleteBagian,
  type BagianWithCount,
} from "@/actions/bagian";

interface BagianManagerProps {
  initialBagian: BagianWithCount[];
  userRole: string;
}

export function BagianManager({
  initialBagian,
  userRole,
}: BagianManagerProps) {
  const [departments, setDepartments] = useState<BagianWithCount[]>(initialBagian);
  const [isPending, startTransition] = useTransition();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<BagianWithCount | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<BagianWithCount | null>(null);

  // Form fields
  const [formNama, setFormNama] = useState("");
  const [formDeskripsi, setFormDeskripsi] = useState("");
  const [formError, setFormError] = useState("");

  const canManage = userRole === "admin" || userRole === "ketua";
  const canDelete = userRole === "admin";

  // Filtered departments
  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return departments;
    const q = searchQuery.toLowerCase();
    return departments.filter(
      (d) =>
        d.nama.toLowerCase().includes(q) ||
        (d.deskripsi && d.deskripsi.toLowerCase().includes(q)) ||
        d.slug.toLowerCase().includes(q)
    );
  }, [departments, searchQuery]);

  // Open create dialog
  function openCreate() {
    setEditingDept(null);
    setFormNama("");
    setFormDeskripsi("");
    setFormError("");
    setIsFormOpen(true);
  }

  // Open edit dialog
  function openEdit(dept: BagianWithCount) {
    setEditingDept(dept);
    setFormNama(dept.nama);
    setFormDeskripsi(dept.deskripsi || "");
    setFormError("");
    setIsFormOpen(true);
  }

  // Handle form submit (create or update)
  function handleSubmit() {
    const trimmedNama = formNama.trim();
    if (!trimmedNama) {
      setFormError("Nama bagian wajib diisi.");
      return;
    }

    setFormError("");

    startTransition(async () => {
      try {
        if (editingDept) {
          // Update
          const result = await updateBagian(editingDept.id, {
            nama: trimmedNama,
            deskripsi: formDeskripsi.trim() || undefined,
          });

          if (result.error) {
            setFormError(result.error);
            toast.error(result.error);
            return;
          }

          if (result.data) {
            const updated = result.data;
            setDepartments((prev) =>
              prev.map((d) =>
                d.id === editingDept.id
                  ? { ...updated, member_count: d.member_count ?? 0 }
                  : d
              )
            );
            toast.success(`Bagian "${updated.nama}" berhasil diperbarui.`);
          }
        } else {
          // Create
          const result = await createBagian({
            nama: trimmedNama,
            deskripsi: formDeskripsi.trim() || undefined,
          });

          if (result.error) {
            setFormError(result.error);
            toast.error(result.error);
            return;
          }

          if (result.data) {
            const created: BagianWithCount = {
              ...result.data,
              member_count: 0,
            };
            setDepartments((prev) =>
              [...prev, created].sort((a, b) => a.nama.localeCompare(b.nama))
            );
            toast.success(`Bagian "${created.nama}" berhasil ditambahkan.`);
          }
        }

        setIsFormOpen(false);
      } catch {
        setFormError("Terjadi kesalahan sistem. Silakan coba lagi.");
        toast.error("Gagal menyimpan data bagian.");
      }
    });
  }

  // Handle delete
  function handleDelete() {
    if (!deleteTarget) return;

    startTransition(async () => {
      try {
        const result = await deleteBagian(deleteTarget.id);

        if (result.error) {
          toast.error(result.error);
          setDeleteTarget(null);
          return;
        }

        setDepartments((prev) =>
          prev.filter((d) => d.id !== deleteTarget.id)
        );
        toast.success(`Bagian "${deleteTarget.nama}" berhasil dihapus.`);
        setDeleteTarget(null);
      } catch {
        toast.error("Terjadi kesalahan saat menghapus bagian.");
        setDeleteTarget(null);
      }
    });
  }

  // Computed slug preview
  const previewSlug = formNama
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Kelola Bagian Organisasi
            </h1>
            <Badge variant="outline" className="text-xs">
              {departments.length} Bagian
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Daftar divisi dan bidang kepengurusan aktif dalam struktur Karang Taruna.
          </p>
        </div>

        {canManage && (
          <Button onClick={openCreate} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>Tambah Bagian Baru</span>
          </Button>
        )}
      </div>

      {/* Filter and stats row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari bagian berdasarkan nama atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-primary" />
            Total: <strong>{departments.length}</strong> bagian
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary" />
            Total Anggota Terdistribusi:{" "}
            <strong>
              {departments.reduce((acc, curr) => acc + (curr.member_count || 0), 0)}
            </strong>
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredDepartments.length === 0 ? (
        <Card className="py-12 border-dashed">
          <CardContent className="flex flex-col items-center text-center gap-3">
            <Building2 className="h-12 w-12 text-muted-foreground/30" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {searchQuery
                  ? "Tidak ada bagian yang sesuai dengan pencarian."
                  : "Belum ada bagian organisasi yang terdaftar."}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery
                  ? "Coba gunakan kata kunci pencarian yang lain."
                  : canManage
                  ? "Klik tombol 'Tambah Bagian Baru' di atas untuk membuat bagian pertama."
                  : "Hubungi admin untuk mendaftarkan bagian organisasi."}
              </p>
            </div>
            {canManage && !searchQuery && (
              <Button onClick={openCreate} size="sm" className="mt-2 gap-1.5">
                <Plus className="h-4 w-4" />
                <span>Tambah Bagian Pertama</span>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDepartments.map((dept) => {
            const isBendahara = dept.slug === "bendahara";

            return (
              <Card
                key={dept.id}
                className="flex flex-col justify-between hover:shadow-md transition-all duration-200 border-border/70 hover:border-primary/40 group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Building2 className="h-5 w-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isBendahara ? (
                        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-[11px]">
                          Modul Keuangan
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[11px]">
                          Divisi
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                      {dept.nama}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-mono text-muted-foreground/70 bg-muted/60 px-1.5 py-0.5 rounded">
                        /{dept.slug}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                        <Users className="h-3 w-3" />
                        {dept.member_count ?? 0} anggota
                      </span>
                    </div>
                  </div>

                  <CardDescription className="text-xs line-clamp-2 mt-2">
                    {dept.deskripsi || "Tidak ada deskripsi rinci untuk bagian ini."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-2">
                  {/* Primary navigation buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={isBendahara ? "/bagian/bendahara" : `/bagian/${dept.slug}`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1 text-xs h-8 hover:bg-primary/5 hover:text-primary hover:border-primary/40"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Lihat Catatan</span>
                        <ArrowRight className="h-3 w-3 ml-auto opacity-60" />
                      </Button>
                    </Link>

                    <Link href={`/struktur/${dept.slug}/agenda`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 gap-1 hover:bg-primary/5"
                        title="Kelola Agenda & Struktur Bagian"
                      >
                        <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Agenda</span>
                      </Button>
                    </Link>
                  </div>

                  {/* Management buttons for admin / ketua */}
                  {canManage && (
                    <div className="flex items-center gap-1.5 pt-2 border-t border-border/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(dept)}
                      >
                        <Pencil className="h-3 w-3" />
                        <span>Edit</span>
                      </Button>

                      {canDelete && (
                        isBendahara ? (
                          <span
                            className="text-[11px] text-muted-foreground/60 flex items-center gap-1 px-2 py-1 select-none"
                            title="Bagian Bendahara dilindungi sistem dan tidak dapat dihapus"
                          >
                            <Lock className="h-3 w-3" />
                            <span>Terkunci</span>
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(dept)}
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Hapus</span>
                          </Button>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingDept ? "Edit Bagian Organisasi" : "Tambah Bagian Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingDept
                ? `Perbarui informasi untuk divisi/bagian "${editingDept.nama}".`
                : "Tambahkan divisi, biro, atau seksi baru ke dalam struktur Karang Taruna."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="bagian-nama">Nama Bagian *</Label>
              <Input
                id="bagian-nama"
                placeholder="contoh: Humas & Publikasi, Perlengkapan, dll."
                value={formNama}
                onChange={(e) => setFormNama(e.target.value)}
                disabled={isPending}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bagian-deskripsi">Deskripsi Tugas / Fungsi (Opsional)</Label>
              <Textarea
                id="bagian-deskripsi"
                placeholder="Uraikan tugas pokok dan ruang lingkup kerja bagian ini..."
                value={formDeskripsi}
                onChange={(e) => setFormDeskripsi(e.target.value)}
                rows={3}
                disabled={isPending}
              />
            </div>

            {previewSlug && (
              <div className="p-2.5 rounded bg-muted/60 text-xs flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Slug URL:</span>
                <code className="font-mono text-primary font-semibold">
                  /bagian/{previewSlug}
                </code>
              </div>
            )}

            {formError && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-md">
                {formError}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingDept ? "Simpan Perubahan" : "Tambahkan Bagian"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Bagian Organisasi?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus bagian{" "}
              <strong>&ldquo;{deleteTarget?.nama}&rdquo;</strong>?
              {deleteTarget && (deleteTarget.member_count || 0) > 0 ? (
                <span className="block mt-2 text-destructive font-medium">
                  Perhatian: Terdapat {deleteTarget.member_count} anggota yang masih terdaftar di bagian ini. Anda harus memindahkan anggota tersebut sebelum dapat menghapus bagian ini.
                </span>
              ) : (
                <span className="block mt-1">
                  Tindakan ini permanen dan akan menghapus semua agenda serta catatan yang terkait langsung dengan bagian ini.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Ya, Hapus Bagian
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
