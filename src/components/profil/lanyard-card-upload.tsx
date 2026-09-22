'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Crop, Loader2, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

const ACCEPTED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const CARD_WIDTH = 600;
const CARD_HEIGHT = 900;

const Lanyard = dynamic(() => import('@/components/Lanyard'), { ssr: false });

function drawCrop(image: HTMLImageElement, zoom: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) return Promise.reject(new Error('Browser tidak mendukung pemrosesan gambar.'));

  const scale = Math.max(CARD_WIDTH / image.naturalWidth, CARD_HEIGHT / image.naturalHeight) * zoom;
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.drawImage(image, (CARD_WIDTH - width) / 2, (CARD_HEIGHT - height) / 2, width, height);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Gagal menyiapkan gambar.')), 'image/png'));
}

export function LanyardCardUpload({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedCardUrl, setUploadedCardUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => () => { if (sourceUrl) URL.revokeObjectURL(sourceUrl); }, [sourceUrl]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    const { data } = supabase.storage.from('lanyard-cards').getPublicUrl(`${userId}/front.png`);
    const image = new Image();
    image.src = data.publicUrl;
    image.onload = () => { if (!cancelled) setUploadedCardUrl(data.publicUrl); };
    return () => { cancelled = true; };
  }, [userId]);

  const refreshPreview = async (image: HTMLImageElement, nextZoom: number) => {
    try {
      const cropped = await drawCrop(image, nextZoom);
      const nextUrl = URL.createObjectURL(cropped);
      setPreviewUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return nextUrl;
      });
    } catch {
      toast.error('Pratinjau kartu tidak dapat dibuat.');
    }
  };

  const selectFile = (file?: File) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.has(file.type)) return toast.error('Gunakan gambar PNG, JPG, atau WebP.');
    if (file.size > MAX_FILE_SIZE) return toast.error('Ukuran gambar maksimal 10MB.');
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(URL.createObjectURL(file));
    setZoom(1);
  };

  const upload = async () => {
    if (!imageRef.current) return toast.error('Pilih gambar kartu terlebih dahulu.');
    setIsUploading(true);
    try {
      const cropped = await drawCrop(imageRef.current, zoom);
      const supabase = createClient();
      const { error } = await supabase.storage.from('lanyard-cards').upload(`${userId}/front.png`, cropped, {
        contentType: 'image/png', cacheControl: '3600', upsert: true,
      });
      if (error) throw error;
      await queryClient.invalidateQueries();
      router.refresh();
      window.dispatchEvent(new CustomEvent('lanyard-card-updated'));
      const { data } = supabase.storage.from('lanyard-cards').getPublicUrl(`${userId}/front.png`);
      setUploadedCardUrl(data.publicUrl);
      toast.success('Gambar depan kartu lanyard berhasil diperbarui.');
      setSourceUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Lanyard card upload failed:', error);
      toast.error('Gagal mengunggah gambar kartu. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadedCard = async () => {
    setIsUploading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.storage.from('lanyard-cards').remove([`${userId}/front.png`]);
      if (error) throw error;
      setUploadedCardUrl(null);
      await queryClient.invalidateQueries();
      router.refresh();
      window.dispatchEvent(new CustomEvent('lanyard-card-updated'));
      toast.success('Gambar upload kartu dihapus. Kartu kembali ke desain default Anda.');
    } catch (error) {
      console.error('Lanyard card removal failed:', error);
      toast.error('Gagal menghapus gambar kartu. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-3 sm:p-5 sm:pb-3">
        <CardTitle className="flex items-center gap-2"><Crop className="h-4 w-4 text-primary" />Kartu lanyard</CardTitle>
        <CardDescription>Ubah gambar depan kartu Anda. Sisi belakang selalu memakai desain organisasi.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0 sm:p-5 sm:pt-0">
        <input ref={fileInputRef} id="lanyard-card-upload" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => selectFile(event.target.files?.[0])} disabled={isUploading} />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <label htmlFor="lanyard-card-upload" className="flex min-h-24 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-primary/35 bg-muted/30 px-4 text-sm font-medium transition-colors hover:bg-muted">
            <Upload className="h-4 w-4 text-primary" /> Pilih gambar PNG, JPG, atau WebP (maks. 10MB)
          </label>
          {(sourceUrl || uploadedCardUrl) && <div className="relative mx-auto h-[21rem] w-52 shrink-0 overflow-hidden rounded-xl border bg-muted shadow-md sm:h-[25rem] sm:w-64">{sourceUrl && <img ref={imageRef} src={sourceUrl} alt="Sumber crop kartu lanyard" className="sr-only" onLoad={(event) => { imageRef.current = event.currentTarget; void refreshPreview(event.currentTarget, zoom); }} />}{(previewUrl || uploadedCardUrl) && <Lanyard frontImage={previewUrl || uploadedCardUrl} backImage="/lanyard/kartu-belakang.png" imageFit="cover" showLanyard={false} previewOnly position={[0, 0, 17]} gravity={[0, 0, 0]} fov={17} className="min-h-0" />}</div>}
        </div>
        {sourceUrl && <div className="space-y-2"><div className="flex items-center justify-between text-xs text-muted-foreground"><Label htmlFor="lanyard-card-zoom">Skala crop</Label><span>{Math.round(zoom * 100)}%</span></div><Input id="lanyard-card-zoom" type="range" min="1" max="2" step="0.01" value={zoom} onChange={(event) => { const nextZoom = Number(event.target.value); setZoom(nextZoom); if (imageRef.current) void refreshPreview(imageRef.current, nextZoom); }} /><div className="flex flex-wrap justify-end gap-2"><Button type="button" onClick={upload} loading={isUploading} className="gap-2">{isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}Simpan gambar kartu</Button></div></div>}
        {uploadedCardUrl && <div className="flex justify-end"><Button type="button" variant="outline" onClick={removeUploadedCard} disabled={isUploading} className="gap-2 border-destructive/35 text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" />Hapus gambar upload</Button></div>}
      </CardContent>
    </Card>
  );
}
