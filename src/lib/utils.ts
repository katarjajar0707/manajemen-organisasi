import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
