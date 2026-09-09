import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const IMAGE_FILE_EXTENSIONS = /\.(apng|avif|bmp|gif|heic|heif|ico|jfi|jfif|jif|jp2|j2k|jpf|jpx|jpeg|jpg|jxl|png|svg|tif|tiff|webp)$/i;
const HEIC_FILE_EXTENSIONS = /\.(heic|heif)$/i;

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/') || IMAGE_FILE_EXTENSIONS.test(file.name);
}

export function isImageUrl(url: string): boolean {
  return IMAGE_FILE_EXTENSIONS.test(url.split(/[?#]/)[0]);
}

export function isHeicFile(file: File): boolean {
  return HEIC_FILE_EXTENSIONS.test(file.name) || file.type === 'image/heic' || file.type === 'image/heif';
}

export function isHeicUrl(url: string): boolean {
  return HEIC_FILE_EXTENSIONS.test(url.split(/[?#]/)[0]);
}

export function normalizeWhatsAppNumber(value: string): string {
  let digits = value.replace(/\D/g, '');

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  if (digits.startsWith('62')) {
    return digits;
  }

  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }

  return digits ? `62${digits}` : '';
}
