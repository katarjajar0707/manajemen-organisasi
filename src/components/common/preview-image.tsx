'use client';

import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import { isHeicFile, isHeicUrl } from '@/lib/utils';

interface PreviewImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  file?: File;
  src?: string;
}

export function PreviewImage({ file, src, alt, onError, ...props }: PreviewImageProps) {
  const [previewSrc, setPreviewSrc] = useState(src);
  const [failedSource, setFailedSource] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    const sourceIsHeic = Boolean(file && isHeicFile(file)) || Boolean(src && isHeicUrl(src));

    if (!sourceIsHeic) return () => undefined;

    const convertHeic = async () => {
      try {
        const { default: heic2any } = await import('heic2any');
        const sourceBlob =
          file ||
          (src
            ? await fetch(src).then((response) => {
                if (!response.ok) throw new Error('Gagal mengambil gambar HEIC.');
                return response.blob();
              })
            : null);
        if (!sourceBlob) throw new Error('Sumber gambar tidak ditemukan.');

        const converted = await heic2any({ blob: sourceBlob, toType: 'image/jpeg', quality: 0.9 });
        const convertedBlob = Array.isArray(converted) ? converted[0] : converted;
        objectUrl = URL.createObjectURL(convertedBlob);
        if (!cancelled) setPreviewSrc(objectUrl);
      } catch {
        if (!cancelled) setFailedSource(src || file?.name || null);
      }
    };

    void convertHeic();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file, src]);

  if (failedSource && failedSource === (src || file?.name)) {
    return (
      <span className="flex h-full min-h-10 w-full items-center justify-center bg-muted px-2 text-center text-[10px] text-muted-foreground" role="img" aria-label={alt}>
        HEIC tidak dapat dipreview
      </span>
    );
  }

  return <img {...props} src={previewSrc} alt={alt} onError={onError} />;
}
