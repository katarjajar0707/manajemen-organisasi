"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
type Foto = {
  id: string;
  url: string;
  caption: string;
  uploadedBy: string;
  tanggal: string;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Placeholder gradient colors as dummy "images"
const PLACEHOLDER_COLORS = [
  "from-emerald-400 to-teal-600",
  "from-blue-400 to-indigo-600",
  "from-violet-400 to-purple-600",
  "from-rose-400 to-pink-600",
  "from-amber-400 to-orange-600",
  "from-cyan-400 to-sky-600",
  "from-lime-400 to-green-600",
  "from-fuchsia-400 to-rose-600",
];

const MOCK_FOTO: Foto[] = [
  {
    id: "1",
    url: "",
    caption: "Pembukaan acara kerja bakti oleh Ketua RT bersama warga.",
    uploadedBy: "Rian (Acara)",
    tanggal: "14 Sep 2026",
  },
  {
    id: "2",
    url: "",
    caption: "Tim pemuda bergotong royong membersihkan selokan utama.",
    uploadedBy: "Rian (Acara)",
    tanggal: "14 Sep 2026",
  },
  {
    id: "3",
    url: "",
    caption: "Pengecatan ulang gapura RW 05 dengan warna merah putih.",
    uploadedBy: "Deni (Sarpras)",
    tanggal: "14 Sep 2026",
  },
  {
    id: "4",
    url: "",
    caption: "Ibu-ibu PKK menyiapkan konsumsi dan minuman untuk peserta.",
    uploadedBy: "Dewi (Sekretaris)",
    tanggal: "14 Sep 2026",
  },
  {
    id: "5",
    url: "",
    caption: "Penanaman bibit pohon mangga di sudut jalan lingkungan.",
    uploadedBy: "Ahmad (Lingkungan)",
    tanggal: "14 Sep 2026",
  },
  {
    id: "6",
    url: "",
    caption: "Sesi foto bersama seluruh peserta di depan gapura.",
    uploadedBy: "Rian (Acara)",
    tanggal: "14 Sep 2026",
  },
  {
    id: "7",
    url: "",
    caption: "Pemuda-pemudi RT 03 membawa perlengkapan kebersihan.",
    uploadedBy: "Sari (Humas)",
    tanggal: "14 Sep 2026",
  },
  {
    id: "8",
    url: "",
    caption: "Wajah ceria seluruh warga RW 05 usai kegiatan kerja bakti.",
    uploadedBy: "Deni (Sarpras)",
    tanggal: "14 Sep 2026",
  },
];

export function DokumentasiManager({ eventId }: { eventId: string }) {
  const [fotos, setFotos] = useState<Foto[]>(MOCK_FOTO);
  const [preview, setPreview] = useState<Foto | null>(null);
  const [editFoto, setEditFoto] = useState<Foto | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [deleteItem, setDeleteItem] = useState<Foto | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newCaption, setNewCaption] = useState("");

  const openPreview = (f: Foto) => setPreview(f);
  const openEdit = (f: Foto) => {
    setEditFoto(f);
    setEditCaption(f.caption);
  };
  const openDelete = (f: Foto) => setDeleteItem(f);

  const handleSaveEdit = () => {
    if (!editFoto) return;
    setFotos((prev) =>
      prev.map((f) => (f.id === editFoto.id ? { ...f, caption: editCaption } : f))
    );
    setEditFoto(null);
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    setFotos((prev) => prev.filter((f) => f.id !== deleteItem.id));
    setDeleteItem(null);
  };

  const handleUpload = () => {
    const newFoto: Foto = {
      id: Date.now().toString(),
      url: "",
      caption: newCaption || "Foto dokumentasi kegiatan.",
      uploadedBy: "Anda (Pengguna)",
      tanggal: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
    setFotos((prev) => [newFoto, ...prev]);
    setNewCaption("");
    setUploadOpen(false);
  };

  const previewIdx = preview ? fotos.findIndex((f) => f.id === preview.id) : -1;
  const goPrev = () => previewIdx > 0 && setPreview(fotos[previewIdx - 1]);
  const goNext = () => previewIdx < fotos.length - 1 && setPreview(fotos[previewIdx + 1]);

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
            <h1 className="text-xl font-bold tracking-tight">Dokumentasi Kegiatan</h1>
            <p className="text-xs text-muted-foreground">
              Galeri foto dokumentasi resmi kegiatan.
            </p>
          </div>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4" />
          <span>Upload Foto</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Camera className="h-4 w-4 text-primary" />
          <strong className="text-foreground">{fotos.length}</strong> foto tersimpan
        </span>
      </div>

      {/* Gallery Grid */}
      {fotos.length === 0 ? (
        <Card>
          <CardContent className="py-20 flex flex-col items-center gap-3 text-muted-foreground">
            <ImageOff className="h-12 w-12 opacity-30" />
            <p className="font-medium">Belum ada foto dokumentasi</p>
            <Button size="sm" className="gap-2 mt-2" onClick={() => setUploadOpen(true)}>
              <Plus className="h-4 w-4" /> Upload Foto Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {fotos.map((foto, idx) => (
            <div
              key={foto.id}
              className="group relative rounded-lg overflow-hidden border bg-card aspect-square cursor-pointer"
              onClick={() => openPreview(foto)}
            >
              {/* Dummy gradient as photo placeholder */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${PLACEHOLDER_COLORS[idx % PLACEHOLDER_COLORS.length]} opacity-70`}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="h-8 w-8 text-white/80" />
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(foto);
                    }}
                    className="p-1.5 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDelete(foto);
                    }}
                    className="p-1.5 rounded-md bg-red-500/70 hover:bg-red-500/90 text-white transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <p className="text-white text-[11px] leading-tight line-clamp-2">
                    {foto.caption}
                  </p>
                  <p className="text-white/60 text-[10px] mt-1">{foto.tanggal}</p>
                </div>
              </div>

              {/* Zoom icon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-7 w-7 text-white drop-shadow" />
              </div>
            </div>
          ))}

          {/* Add more tile */}
          <div
            className="relative rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/20 aspect-square cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
            onClick={() => setUploadOpen(true)}
          >
            <Plus className="h-8 w-8" />
            <span className="text-xs font-medium">Upload Foto</span>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={!!preview} onOpenChange={(v) => !v && setPreview(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <div className="relative">
            <div
              className={`h-72 sm:h-96 bg-gradient-to-br ${preview ? PLACEHOLDER_COLORS[fotos.findIndex(f => f.id === preview.id) % PLACEHOLDER_COLORS.length] : "from-gray-400 to-gray-600"} flex items-center justify-center`}
            >
              <Camera className="h-20 w-20 text-white/50" />
            </div>

            {/* Navigation */}
            {previewIdx > 0 && (
              <button
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            {previewIdx < fotos.length - 1 && (
              <button
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </button>
            )}

            <button
              onClick={() => setPreview(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 space-y-2">
            <p className="text-sm leading-relaxed">{preview?.caption}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Oleh: {preview?.uploadedBy}</span>
              <span>{preview?.tanggal}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => {
                  if (preview) { openEdit(preview); setPreview(null); }
                }}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit Caption
              </Button>
              <Badge variant="outline" className="text-xs">
                {previewIdx + 1} / {fotos.length}
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Caption Dialog */}
      <Dialog open={!!editFoto} onOpenChange={(v) => !v && setEditFoto(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Caption Foto</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="edit-caption">Caption</Label>
            <Input
              id="edit-caption"
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditFoto(null)}>
              Batal
            </Button>
            <Button onClick={handleSaveEdit}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteItem} onOpenChange={(v) => !v && setDeleteItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Foto</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus foto ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteItem(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus Foto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Upload Foto Dokumentasi</DialogTitle>
            <DialogDescription>
              Pilih foto dari perangkat Anda dan tambahkan caption.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer">
              <Upload className="h-8 w-8" />
              <p className="text-sm font-medium">Klik untuk pilih foto</p>
              <p className="text-xs">JPG, PNG, WEBP (maks. 10 MB)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">Caption (opsional)</Label>
              <Input
                id="caption"
                placeholder="Deskripsi foto..."
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setUploadOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleUpload} className="gap-1.5">
              <Upload className="h-4 w-4" /> Upload Foto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
