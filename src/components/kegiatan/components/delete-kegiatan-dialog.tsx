'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { KegiatanData } from '@/actions/kegiatan';

interface DeleteKegiatanDialogProps {
  open: boolean;
  kegiatan: KegiatanData | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteKegiatanDialog({
  open,
  kegiatan,
  isPending,
  onClose,
  onConfirm,
}: DeleteKegiatanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-destructive">Hapus Kegiatan</DialogTitle>
          <DialogDescription className="text-xs">
            Yakin ingin menghapus kegiatan <strong className="text-foreground">&quot;{kegiatan?.judul}&quot;</strong>?
            Seluruh foto dokumentasi yang terkait juga akan terhapus.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 mt-3">
          <Button variant="outline" size="sm" className="text-xs" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="text-xs gap-1.5"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Hapus Kegiatan</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
