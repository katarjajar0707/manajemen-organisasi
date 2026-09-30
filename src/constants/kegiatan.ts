export const STATUS_COLOR: Record<string, string> = {
  Mendatang: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  Berlangsung: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  Selesai: 'bg-muted text-muted-foreground border-border',
};

export function formatTanggal(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTanggalShort(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
