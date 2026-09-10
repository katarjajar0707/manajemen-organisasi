'use client';

import { forwardRef, useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';
import { isHeicFile, isHeicUrl } from '@/lib/utils';
import { convertHeicToJpeg } from '@/lib/client-image';

interface PreviewImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  file?: File;
  src?: string;
}

export const PreviewImage = forwardRef<HTMLImageElement, PreviewImageProps>(function PreviewImage({ file, src, alt, onError, className, ...props }, ref) {
  const [previewSrc, setPreviewSrc] = useState<string | undefined>(src);
  const [isConverting, setIsConverting] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [conversionAttempted, setConversionAttempted] = useState(false);
  const fallbackObjectUrl = useRef<string | null>(null);
  const sourceIsHeic = file ? isHeicFile(file) : Boolean(src && isHeicUrl(src));

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    setHasFailed(false);
    setConversionAttempted(false);

    if (!sourceIsHeic) {
      if (file) {
        objectUrl = URL.createObjectURL(file);
        setPreviewSrc(objectUrl);
      } else {
        setPreviewSrc(src);
      }
      setIsConverting(false);
      return () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    }

    const convertHeic = async () => {
      setPreviewSrc(undefined);
      setIsConverting(true);
      try {
        const sourceBlob =
          file ||
          (src
            ? await fetch(src).then((response) => {
                if (!response.ok) throw new Error('Gagal mengambil gambar HEIC.');
                return response.blob();
              })
            : null);
        if (!sourceBlob) throw new Error('Sumber gambar tidak ditemukan.');

        const convertedBlob = await convertHeicToJpeg(new File([sourceBlob], 'preview.heic', { type: 'image/heic' }));
        objectUrl = URL.createObjectURL(convertedBlob);
        if (!cancelled) {
          setPreviewSrc(objectUrl);
          setIsConverting(false);
        }
      } catch {
        if (!cancelled) {
          setHasFailed(true);
          setIsConverting(false);
        }
      }
    };

    void convertHeic();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (fallbackObjectUrl.current) {
        URL.revokeObjectURL(fallbackObjectUrl.current);
        fallbackObjectUrl.current = null;
      }
    };
  }, [file, src, sourceIsHeic]);

  const waitingForConversion = sourceIsHeic && previewSrc === src;

  if (isConverting || waitingForConversion || hasFailed || !previewSrc) {
    return (
      <span className={`flex h-full min-h-10 w-full items-center justify-center bg-muted px-2 text-center text-[10px] text-muted-foreground ${className || ''}`} role="img" aria-label={alt}>
        {isConverting || waitingForConversion ? 'Memuat preview...' : sourceIsHeic ? 'HEIC tidak dapat dipreview' : 'Gambar tidak dapat dipreview'}
      </span>
    );
  }

  return (
    <img
      {...props}
      ref={ref}
      className={className}
      src={previewSrc}
      alt={alt}
      onError={(event) => {
        if (!conversionAttempted && src && !file) {
          setConversionAttempted(true);
          setIsConverting(true);
          setPreviewSrc(undefined);
          void fetch(src)
            .then((response) => {
              if (!response.ok) throw new Error('Gagal mengambil gambar untuk fallback HEIC.');
              return response.blob();
            })
            .then((blob) => convertHeicToJpeg(new File([blob], 'preview.heic', { type: 'image/heic' })))
            .then((convertedBlob) => {
              fallbackObjectUrl.current = URL.createObjectURL(convertedBlob);
              setPreviewSrc(fallbackObjectUrl.current);
              setIsConverting(false);
            })
            .catch(() => {
              setHasFailed(true);
              setIsConverting(false);
              onError?.(event);
            });
          return;
        }

        setHasFailed(true);
        onError?.(event);
      }}
    />
  );
});

PreviewImage.displayName = 'PreviewImage';
