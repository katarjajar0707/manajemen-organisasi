'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { ItemInventaris } from '@/actions/inventaris';

interface InventarisDeleteDialogProps {
  open: boolean;
  item: ItemInventaris | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function InventarisDeleteDialog({
  open,
  item,
  isPending,
  onClose,
  onConfirm,
}: InventarisDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[420px] w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Hapus Aset Barang?
          </DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus <strong>{item?.nama}</strong> dari inventaris organisasi? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 pt-3">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
            Hapus Barang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
