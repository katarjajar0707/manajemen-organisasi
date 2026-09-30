'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Pencil, Trash2 } from 'lucide-react';
import { ItemInventaris } from '@/actions/inventaris';
import { PreviewImage } from '@/components/common/preview-image';

interface InventarisDetailDialogProps {
  open: boolean;
  item: ItemInventaris | null;
  onClose: () => void;
  onEdit: (item: ItemInventaris) => void;
  onDelete: (item: ItemInventaris) => void;
}

export function InventarisDetailDialog({
  open,
  item,
  onClose,
  onEdit,
  onDelete,
}: InventarisDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px] w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Rincian Inventaris
          </DialogTitle>
        </DialogHeader>

        {item && (
          <div className="space-y-4 py-2 text-sm">
            {item.fotoUrl && (
              <div className="h-48 overflow-hidden rounded-lg border border-border">
                <PreviewImage
                  src={item.fotoUrl}
                  alt={item.nama}
                  className="h-full w-full object-cover object-center"
                />
              </div>
            )}

            <div>
              <h3 className="font-bold text-base text-foreground">{item.nama}</h3>
              <Badge variant="outline" className="text-xs mt-1">
                {item.kategori}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border border-border text-xs">
              <div>
                <span className="text-muted-foreground block">Jumlah:</span>
                <span className="font-semibold text-foreground text-sm">
                  {item.jumlah} {item.satuan}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Kondisi:</span>
                <span className="capitalize font-semibold text-foreground text-sm">
                  {item.kondisi.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Lokasi:</span>
                <span className="font-medium text-foreground">{item.lokasi}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Status:</span>
                <span className="font-semibold text-foreground">{item.status}</span>
              </div>
            </div>

            {item.keterangan && (
              <div>
                <span className="text-xs font-medium text-muted-foreground block mb-1">Keterangan:</span>
                <p className="text-xs bg-muted/20 p-2.5 rounded border border-border text-muted-foreground">
                  {item.keterangan}
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex-row items-center justify-between gap-2 pt-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive h-9 px-2.5 text-xs gap-1.5"
            onClick={() => {
              onClose();
              if (item) onDelete(item);
            }}
          >
            <Trash2 className="h-4 w-4" />
            <span>Hapus Barang</span>
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 text-xs"
              onClick={() => {
                onClose();
                if (item) onEdit(item);
              }}
            >
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
            <Button variant="secondary" size="sm" className="h-9 text-xs" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
