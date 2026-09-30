import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText } from 'lucide-react';
import { isImageUrl } from '@/lib/utils';
import { PreviewImage } from '@/components/common/preview-image';

interface PreviewLampiranDialogProps {
  previewUrl: string | null;
  onOpenChange: (open: boolean) => void;
}

export function PreviewLampiranDialog({ previewUrl, onOpenChange }: PreviewLampiranDialogProps) {
  return (
    <Dialog open={!!previewUrl} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full p-2">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Bukti Transaksi</DialogTitle>
        </DialogHeader>
        <div className="p-4 flex items-center justify-center min-h-[40vh] bg-muted/20 rounded-md">
          {previewUrl &&
            (isImageUrl(previewUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <PreviewImage src={previewUrl} alt="Lampiran" className="max-w-full max-h-[70vh] object-contain rounded" />
            ) : (
              <div className="text-center space-y-4">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Berkas bukan berupa gambar yang bisa di-preview.</p>
                <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="default" className="gap-2">
                    Unduh / Buka Berkas <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
