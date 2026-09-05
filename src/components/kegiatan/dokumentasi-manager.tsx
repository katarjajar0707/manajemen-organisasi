"use client";

import { useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Camera,
  Upload,
  X,
  Pencil,
  Trash2,
  ZoomIn,
  ImageOff,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  MapPin,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import {
  uploadDokumentasi,
  updateCaptionDokumentasi,
  deleteDokumentasi,
} from "@/actions/dokumentasi";

export interface FotoItem {
  id: string;
  foto_url?: string;
  url?: string;
  caption: string;
  uploadedBy?: string;
  created_at?: string;
  tanggal?: string;
}

interface DokumentasiManagerProps {
  kegiatan: any;
  initialFotos?: FotoItem[];
  userRole?: string;
}

export function DokumentasiManager({
  kegiatan,
  initialFotos = [],
  userRole = "anggota",
}: DokumentasiManagerProps) {
  const [fotos, setFotos] = useState<FotoItem[]>(initialFotos);
  const [preview, setPreview] = useState<FotoItem | null>(null);

  // Edit State
  const [editFoto, setEditFoto] = useState<FotoItem | null>(null);
  const [editCaption, setEditCaption] = useState("");

  // Delete State
  const [deleteItem, setDeleteItem] = useState<FotoItem | null>(null);

  // Upload State
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getFotoUrl = (f: FotoItem) => f.foto_url || f.url || "";

  const openPreview = (f: FotoItem) => setPreview(f);
  const openEdit = (f: FotoItem) => {
    setEditFoto(f);
    setEditCaption(f.caption);
  };
  const openDelete = (f: FotoItem) => setDeleteItem(f);

  // File selection for upload
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFilesList: File[] = [];
    const newPreviewsList: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        newFilesList.push(file);
        newPreviewsList.push(URL.createObjectURL(file));
      }
    });

    setSelectedFiles((prev) => [...prev, ...newFilesList]);
    setFilePreviews((prev) => [...prev, ...newPreviewsList]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      setErrorMessage("Pilih setidaknya satu file foto.");
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("caption", newCaption || `Dokumentasi ${kegiatan.judul}`);
      selectedFiles.forEach((file) => {
        formData.append("foto", file);
      });

      const res = await uploadDokumentasi(kegiatan.id, formData);
      if (res.error) {
        setErrorMessage(res.error);
        return;
      }

      // Refresh list: temporarily push uploaded preview items
      const newItems: FotoItem[] = selectedFiles.map((file, idx) => ({
        id: `temp-${Date.now()}-${idx}`,
        foto_url: filePreviews[idx],
        caption: newCaption || `Dokumentasi ${kegiatan.judul}`,
        uploadedBy: "Anda (Baru saja)",
        created_at: new Date().toISOString(),
        tanggal: "Baru saja",
      }));

      setFotos((prev) => [...newItems, ...prev]);
      setSelectedFiles([]);
      setFilePreviews([]);
      setNewCaption("");
      setUploadOpen(false);
    });
  };

  const handleSaveEdit = () => {
    if (!editFoto) return;

    startTransition(async () => {
      const res = await updateCaptionDokumentasi(editFoto.id, kegiatan.id, editCaption);
      if (res.error) {
        alert(res.error);
        return;
      }

      setFotos((prev) =>
        prev.map((f) => (f.id === editFoto.id ? { ...f, caption: editCaption } : f))
      );
      setEditFoto(null);
    });
  };

  const handleDelete = () => {
    if (!deleteItem) return;

    startTransition(async () => {
      const res = await deleteDokumentasi(deleteItem.id, kegiatan.id);
      if (res.error) {
        alert(res.error);
        return;
      }

      setFotos((prev) => prev.filter((f) => f.id !== deleteItem.id));
      if (preview && preview.id === deleteItem.id) {
        setPreview(null);
      }
      setDeleteItem(null);
    });
  };

  const previewIdx = preview ? fotos.findIndex((f) => f.id === preview.id) : -1;
  const goPrev = () => previewIdx > 0 && setPreview(fotos[previewIdx - 1]);
  const goNext = () => previewIdx < fotos.length - 1 && setPreview(fotos[previewIdx + 1]);

  const handleDownload = (url: string, filename?: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.download = filename || `dokumentasi_${kegiatan.id}_foto.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/kegiatan">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Dokumentasi Acara
              </Badge>
              <span className="text-xs text-muted-foreground">• {kegiatan.bagian?.nama || "Umum"}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5">
              {kegiatan.judul}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {kegiatan.tanggalMulai}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {kegiatan.lokasi || "Balai Warga"}
              </span>
            </p>
          </div>
        </div>

        <Button
          size="sm"
          className="gap-2 bg-primary hover:bg-primary/90 text-xs h-8"
          onClick={() => {
            setErrorMessage(null);
            setUploadOpen(true);
          }}
        >
          <Upload className="h-4 w-4" />
          <span>Upload Foto Dokumentasi</span>
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between text-xs bg-card border rounded-xl px-4 py-2.5 shadow-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Camera className="h-4 w-4 text-primary" />
          <strong className="text-foreground">{fotos.length}</strong> foto tersimpan untuk kegiatan ini
        </span>
        <span className="text-[11px]">
          Klik foto untuk memperbesar, melihat keterangan, atau mengunduh.
        </span>
      </div>

      {/* Gallery Grid */}
      {fotos.length === 0 ? (
        <Card className="border shadow-xs">
          <CardContent className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <ImageOff className="h-12 w-12 opacity-30" />
            <p className="font-semibold text-sm">Belum ada foto dokumentasi untuk acara ini</p>
            <p className="text-xs max-w-sm text-center">
              Unggah foto-foto pelaksanaan kegiatan untuk dokumentasi organisasi dan laporan pertanggungjawaban warga.
            </p>
            <Button
              size="sm"
              className="gap-2 mt-2 bg-primary hover:bg-primary/90 text-xs"
              onClick={() => setUploadOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Upload Foto Pertama</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {fotos.map((foto) => {
            const url = getFotoUrl(foto);
            return (
              <div
                key={foto.id}
                className="group relative rounded-xl overflow-hidden border bg-muted aspect-square cursor-pointer shadow-xs hover:shadow-md transition-all"
                onClick={() => openPreview(foto)}
              >
                {url ? (
                  <img
                    src={url}
                    alt={foto.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Camera className="h-8 w-8 text-muted-foreground opacity-40" />
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 text-white">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                      <ZoomIn className="h-3 w-3 inline mr-1" /> Perbesar
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(foto);
                        }}
                        className="p-1.5 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors"
                        title="Edit Caption"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDelete(foto);
                        }}
                        className="p-1.5 rounded-md bg-destructive/80 hover:bg-destructive text-white transition-colors"
                        title="Hapus Foto"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-white text-xs font-medium leading-tight line-clamp-2">
                      {foto.caption}
                    </p>
                    {foto.created_at && (
                      <p className="text-white/70 text-[10px] mt-1">
                        {new Date(foto.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enlarged Preview Modal (PRD 4.3.1 & 4.6) */}
      <Dialog open={!!preview} onOpenChange={(v) => !v && setPreview(null)}>
        <DialogContent className="max-w-3xl w-[95vw] p-0 overflow-hidden bg-background">
          <DialogHeader className="p-4 pb-2 flex flex-row items-center justify-between border-b space-y-0">
            <div>
              <DialogTitle className="text-sm font-semibold">Preview Dokumentasi Kegiatan</DialogTitle>
              <DialogDescription className="text-xs">
                Foto {previewIdx + 1} dari {fotos.length}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {preview && getFotoUrl(preview) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1.5"
                  onClick={() => handleDownload(getFotoUrl(preview))}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Unduh Foto</span>
                </Button>
              )}
            </div>
          </DialogHeader>

          {/* Photo Display Area with Prev/Next Controls */}
          <div className="relative bg-black flex items-center justify-center min-h-[300px] max-h-[70vh] overflow-hidden">
            {preview && getFotoUrl(preview) ? (
              <img
                src={getFotoUrl(preview)}
                alt={preview.caption}
                className="max-h-[70vh] max-w-full object-contain"
              />
            ) : (
              <div className="p-12 text-center text-white/50">
                <ImageOff className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Foto tidak dapat dimuat</p>
              </div>
            )}

            {/* Navigation Buttons */}
            {previewIdx > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 hover:bg-black/70 text-white"
                onClick={goPrev}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            {previewIdx < fotos.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 hover:bg-black/70 text-white"
                onClick={goNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Caption & Metadata Footer */}
          <div className="p-4 border-t bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <p className="font-medium text-foreground">{preview?.caption}</p>
              <p className="text-muted-foreground text-[11px]">
                {kegiatan.judul} • Diunggah pada {preview?.tanggal || preview?.created_at?.split("T")[0]}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => setPreview(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog (Multi-Photo & Caption) */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <span>Unggah Foto Dokumentasi</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Pilih satu atau beberapa foto kegiatan sekaligus untuk diunggah ke galeri resmi.
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-4 py-2">
            {/* File Drop / Select Area */}
            <div
              className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-muted/20 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                onChange={handleFilesSelected}
                className="hidden"
              />
              <Camera className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-foreground">
                Klik untuk memilih foto dokumentasi
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Mendukung banyak file foto sekaligus (JPG, PNG, WebP)
              </p>
            </div>

            {/* Selected Files Thumbnails */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    {selectedFiles.length} foto dipilih
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setSelectedFiles([]);
                      setFilePreviews([]);
                    }}
                  >
                    Hapus Semua
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 border rounded-lg bg-muted/10">
                  {filePreviews.map((previewUrl, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden aspect-square border group">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSelectedFile(idx);
                        }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Caption Input */}
            <div className="space-y-1.5">
              <Label className="text-xs">Keterangan / Caption Foto</Label>
              <Textarea
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder={`Contoh: Sesi kerja bakti gotong royong warga...`}
                rows={2}
                className="text-xs resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setUploadOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="text-xs bg-primary hover:bg-primary/90 gap-1.5"
              onClick={handleUpload}
              disabled={isPending || selectedFiles.length === 0}
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Unggah {selectedFiles.length > 0 ? `(${selectedFiles.length} Foto)` : ""}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Caption Dialog */}
      <Dialog open={!!editFoto} onOpenChange={(v) => !v && setEditFoto(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Edit Keterangan Foto</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <Label className="text-xs">Caption Foto</Label>
            <Textarea
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              rows={3}
              className="text-xs resize-none"
            />
          </div>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setEditFoto(null)} disabled={isPending}>
              Batal
            </Button>
            <Button size="sm" className="text-xs bg-primary hover:bg-primary/90 gap-1.5" onClick={handleSaveEdit} disabled={isPending}>
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Simpan</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={(v) => !v && setDeleteItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive text-base">Hapus Foto Dokumentasi?</DialogTitle>
            <DialogDescription className="text-xs">
              Foto ini akan dihapus permanen dari galeri dokumentasi kegiatan. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-3">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setDeleteItem(null)} disabled={isPending}>
              Batal
            </Button>
            <Button variant="destructive" size="sm" className="text-xs gap-1.5" onClick={handleDelete} disabled={isPending}>
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Hapus Foto</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
