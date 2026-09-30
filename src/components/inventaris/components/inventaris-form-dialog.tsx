'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Pencil, Trash2, Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import { ItemInventaris, KategoriBarang, KondisiBarang } from '@/actions/inventaris';
import { uploadLampiran } from '@/actions/storage';
import { isImageFile } from '@/lib/utils';
import { convertHeicToJpeg } from '@/lib/client-image';
import { PreviewImage } from '@/components/common/preview-image';
import { InventarisFormData, INITIAL_INVENTARIS_FORM, KATEGORI_OPTIONS, KONDISI_OPTIONS } from '@/constants/inventaris';

interface InventarisFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  item: ItemInventaris | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: InventarisFormData) => void;
  onDeleteRequest?: (item: ItemInventaris) => void;
  onToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export function InventarisFormDialog({
  open,
  mode,
  item,
  isPending,
  onClose,
  onSubmit,
  onDeleteRequest,
  onToast,
}: InventarisFormDialogProps) {
  const [formData, setFormData] = useState<InventarisFormData>(INITIAL_INVENTARIS_FORM);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && item) {
        setFormData({
          nama: item.nama || '',
          kategori: (item.kategori as KategoriBarang) || 'Elektronik & Sound',
          jumlah: item.jumlah,
          satuan: item.satuan,
          kondisi: item.kondisi,
          lokasi: item.lokasi,
          fotoUrl: item.fotoUrl || '',
          keterangan: item.keterangan || '',
        });
      } else {
        setFormData(INITIAL_INVENTARIS_FORM);
      }
    }
  }, [open, mode, item]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isImageFile(file)) {
      onToast('File lampiran harus berupa gambar.', 'warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onToast('Ukuran file tidak boleh melebihi 5MB.', 'warning');
      return;
    }

    try {
      setIsUploading(true);
      let uploadFile: File;
      try {
        uploadFile = await convertHeicToJpeg(file);
      } catch {
        onToast('File HEIC tidak dapat dikonversi menjadi JPG.', 'warning');
        return;
      }

      const res = await uploadLampiran(uploadFile, 'inventaris');
      if (res.error || !res.url) {
        onToast(res.error || 'Gagal mengunggah foto inventaris.', 'warning');
        return;
      }

      setFormData((prev) => ({ ...prev, fotoUrl: res.url || '' }));
      onToast('Foto berhasil diunggah!', 'success');
    } catch (err: unknown) {
      onToast(err instanceof Error ? err.message : 'Terjadi kesalahan upload.', 'warning');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama) return;
    onSubmit(formData);
  };

  const isEdit = mode === 'edit';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[540px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? <Pencil className="h-5 w-5 text-primary" /> : <Package className="h-5 w-5 text-primary" />}
            {isEdit ? 'Edit Data Barang' : 'Tambah Aset Barang Baru'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Perbarui rincian aset inventaris barang.'
              : 'Isi data detail barang inventaris baru untuk didaftarkan ke database organisasi.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="inv-nama" className="text-xs">
              Nama Barang <span className="text-destructive">*</span>
            </Label>
            <Input
              id="inv-nama"
              placeholder="Contoh: Sound System Portable 12 Inch"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="inv-kategori" className="text-xs">
                Kategori
              </Label>
              <Select
                value={formData.kategori}
                onValueChange={(val: KategoriBarang) => setFormData({ ...formData, kategori: val })}
              >
                <SelectTrigger id="inv-kategori">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {KATEGORI_OPTIONS.map((kat) => (
                    <SelectItem key={kat} value={kat}>
                      {kat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inv-kondisi" className="text-xs">
                Kondisi Fisik
              </Label>
              <Select
                value={formData.kondisi}
                onValueChange={(val: KondisiBarang) => setFormData({ ...formData, kondisi: val })}
              >
                <SelectTrigger id="inv-kondisi">
                  <SelectValue placeholder="Pilih Kondisi" />
                </SelectTrigger>
                <SelectContent>
                  {KONDISI_OPTIONS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="inv-jumlah" className="text-xs">
                Jumlah
              </Label>
              <Input
                id="inv-jumlah"
                type="number"
                min="1"
                value={formData.jumlah}
                onChange={(e) => setFormData({ ...formData, jumlah: parseInt(e.target.value) || 1 })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inv-satuan" className="text-xs">
                Satuan
              </Label>
              <Input
                id="inv-satuan"
                placeholder="Unit / Pcs / Set / Roll"
                value={formData.satuan}
                onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inv-lokasi" className="text-xs">
              Lokasi Penyimpanan
            </Label>
            <Input
              id="inv-lokasi"
              placeholder="Contoh: Ruang Sekretariat Katar / Gudang RW"
              value={formData.lokasi}
              onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
            />
          </div>

          {/* Foto Upload */}
          <div className="space-y-1.5">
            <Label className="text-xs">Foto Barang (Opsional)</Label>
            <div className="flex items-center gap-3">
              {formData.fotoUrl ? (
                <div className="relative group">
                  <PreviewImage
                    src={formData.fotoUrl}
                    alt="Preview"
                    className="h-16 w-16 rounded-md object-cover border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, fotoUrl: '' })}
                    className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 text-xs shadow"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="h-16 w-16 rounded-md border border-dashed border-border flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.heic,.heif"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5 text-xs"
                >
                  {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  <span>{isUploading ? 'Mengunggah...' : formData.fotoUrl ? 'Ganti Foto' : 'Unggah Foto'}</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inv-keterangan" className="text-xs">
              Keterangan Tambahan (Opsional)
            </Label>
            <Textarea
              id="inv-keterangan"
              placeholder="Catatan kelengkapan, nomor seri, dll..."
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              rows={2}
            />
          </div>

          <DialogFooter className={`pt-2 ${isEdit ? 'flex-row items-center justify-between sm:justify-between' : 'gap-2'}`}>
            {isEdit && item && onDeleteRequest ? (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive h-9 px-2.5 text-xs gap-1.5"
                onClick={() => {
                  onClose();
                  onDeleteRequest(item);
                }}
                disabled={isPending || isUploading}
              >
                <Trash2 className="h-4 w-4" />
                <span>Hapus Barang</span>
              </Button>
            ) : null}
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending || isUploading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    {isEdit ? 'Memperbarui...' : 'Menyimpan...'}
                  </>
                ) : isEdit ? (
                  'Simpan Perubahan'
                ) : (
                  'Simpan ke Inventaris'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
