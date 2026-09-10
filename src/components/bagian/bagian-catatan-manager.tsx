'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { isImageUrl } from '@/lib/utils';
import { convertHeicToJpeg } from '@/lib/client-image';
import { PreviewImage } from '@/components/common/preview-image';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, FileText, Paperclip, Calendar, MoreVertical, Edit, Trash2, ArrowLeft, AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { createCatatan, updateCatatan, deleteCatatan } from '@/actions/catatan';

interface Catatan {
  id: string;
  judul: string;
  isi: string;
  tanggal: string;
  lampiran_url: string | null;
  author?: {
    nama: string;
    role: string;
  };
}

interface BagianCatatanManagerProps {
  slug: string;
  initialCatatan: any[];
}

export function BagianCatatanManager({ slug, initialCatatan }: BagianCatatanManagerProps) {
  const capitalized = slug.charAt(0).toUpperCase() + slug.slice(1);

  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Catatan | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [removeLampiran, setRemoveLampiran] = useState(false);

  const handleOpenCreate = () => {
    setEditingNote(null);
    setTitle('');
    setExcerpt('');
    setFile(null);
    setRemoveLampiran(false);
    setError(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (note: Catatan) => {
    setEditingNote(note);
    setTitle(note.judul);
    setExcerpt(note.isi);
    setFile(null);
    setRemoveLampiran(false);
    setError(null);
    setIsDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim()) return;

    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append('judul', title);
      formData.append('isi', excerpt);
      if (file) {
        try {
          formData.append('lampiran', await convertHeicToJpeg(file));
        } catch {
          setError('File HEIC tidak dapat dikonversi menjadi JPG.');
          return;
        }
      }
      formData.append('removeLampiran', removeLampiran.toString());

      let res;
      if (editingNote) {
        res = await updateCatatan(editingNote.id, formData, slug);
      } else {
        res = await createCatatan(formData, slug);
      }

      if (res?.error) {
        setError(res.error);
      } else {
        setIsDialogOpen(false);
      }
    });
  };

  const handleDelete = () => {
    if (deleteId) {
      startTransition(async () => {
        const res = await deleteCatatan(deleteId, slug);
        if (res?.error) {
          alert('Gagal menghapus: ' + res.error);
        } else {
          setDeleteId(null);
        }
      });
    }
  };

  const filteredNotes = initialCatatan.filter((n: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const authorName = n.author?.nama || '';
    return n.judul.toLowerCase().includes(q) || n.isi.toLowerCase().includes(q) || authorName.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link href="/bagian">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Kelola Bagian</span>
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Catatan Bagian: {capitalized}</h1>
            <Badge variant="secondary" className="text-xs">
              Internal Bagian
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Daftar notula rapat, koordinasi kerja operasional, dan penugasan {capitalized}.</p>
        </div>
        <Button size="sm" className="gap-2 shadow-xs bg-primary hover:bg-primary/90 text-xs h-8 w-full sm:w-auto" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          <span>+ Tulis Catatan Baru</span>
        </Button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input placeholder={`Cari catatan ${capitalized}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 text-xs" />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-muted-foreground border rounded-xl border-dashed">Belum ada catatan. Klik tombol di atas untuk membuat catatan baru.</div>
        ) : (
          filteredNotes.map((note: any) => (
            <Card key={note.id} className="hover:shadow-md transition-all flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-primary" />
                    {new Date(note.tanggal).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <div className="flex items-center gap-1">
                    {note.lampiran_url && (
                      <Badge variant="outline" className="gap-1 text-[10px] text-primary border-primary/30 cursor-pointer hover:bg-primary/5" onClick={() => setPreviewUrl(note.lampiran_url)}>
                        <Paperclip className="h-3 w-3" />
                        Lihat Lampiran
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(note)}>
                          <Edit className="h-3.5 w-3.5 mr-2" />
                          <span>Edit Catatan</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteId(note.id)} className="text-destructive focus:text-destructive">
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          <span>Hapus</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardTitle className="text-base font-semibold mt-1 leading-snug">{note.judul}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{note.isi}</p>
                <div className="pt-3 border-t text-[11px] text-muted-foreground flex justify-between items-center">
                  <span>
                    Ditulis oleh: <strong className="text-foreground">{note.author?.nama || 'Unknown'}</strong>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>{editingNote ? 'Edit Catatan' : 'Tulis Catatan Baru'}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">Catatan ini akan tersimpan pada bagian {capitalized}.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs">Judul Catatan / Notula</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Notula Rapat Koordinasi Panitia Lapangan" className="text-xs" required />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Isi Lengkap Catatan</Label>
                <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={4} placeholder="Tuliskan detail poin instruksi kerja, kesepakatan rapat, atau catatan teknis..." className="text-xs leading-relaxed" required />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Lampiran Berkas (Opsional)</Label>
                <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-xs" accept="image/*,.heic,.heif,.pdf,.doc,.docx" />
                {editingNote?.lampiran_url && !removeLampiran && (
                  <div className="flex items-center justify-between bg-muted/50 p-2 rounded text-xs mt-2">
                    <span className="text-muted-foreground truncate mr-2">Sudah ada lampiran tersimpan</span>
                    <Button type="button" variant="destructive" size="sm" className="h-6 text-[10px] px-2" onClick={() => setRemoveLampiran(true)}>
                      Hapus
                    </Button>
                  </div>
                )}
                {removeLampiran && <p className="text-xs text-destructive mt-1">Lampiran akan dihapus saat disimpan.</p>}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsDialogOpen(false)} disabled={isPending}>
                Batal
              </Button>
              <Button type="submit" size="sm" loading={isPending} disabled={!title.trim() || !excerpt.trim()}>
                Simpan Catatan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Hapus Catatan</span>
            </DialogTitle>
            <DialogDescription className="text-xs">Apakah Anda yakin ingin menghapus catatan ini?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)} disabled={isPending}>
              Batal
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Lampiran Modal */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-3xl w-full p-2">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Preview Lampiran</DialogTitle>
          </DialogHeader>
          <div className="p-4 flex items-center justify-center min-h-[40vh] bg-muted/20 rounded-md">
            {previewUrl && isImageUrl(previewUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <PreviewImage src={previewUrl} alt="Lampiran" className="max-w-full max-h-[70vh] object-contain rounded" />
            ) : (
              <div className="text-center space-y-4">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Berkas bukan berupa gambar yang bisa di-preview.</p>
                <a href={previewUrl || '#'} target="_blank" rel="noopener noreferrer">
                  <Button className="gap-2">
                    Unduh / Buka Berkas <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
