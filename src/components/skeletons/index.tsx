/**
 * Komponen skeleton reusable untuk KartaTuju.
 *
 * Aturan:
 * - Semua komponen adalah Server Components (tanpa "use client", hook, atau state).
 * - Gunakan token warna tema (`bg-muted`) agar mengikuti light/dark mode.
 * - Animasi hanya CSS via `motion-safe:animate-pulse` (sudah ada di primitif Skeleton).
 * - Container diberi `aria-busy="true"` dan `aria-live="polite"`.
 * - Elemen dekoratif di-skip dengan `aria-hidden` (sudah ada di primitif Skeleton).
 */

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Wrapper aksesibel ──────────────────────────────────────────────────────

interface SkeletonContainerProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
}

/** Bungkus semua skeleton dalam container ini agar screen-reader tahu. */
export function SkeletonContainer({
  children,
  className,
  label = "Memuat...",
}: SkeletonContainerProps) {
  return (
    <div aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

// ─── StatCardSkeleton ────────────────────────────────────────────────────────

interface StatCardSkeletonProps {
  /** Jumlah kartu yang dirender. */
  count?: number;
  className?: string;
  gridClassName?: string;
}

/**
 * Skeleton untuk grid kartu statistik (mis. dashboard stats).
 * Secara default meniru grid `grid-cols-2 lg:grid-cols-3 xl:grid-cols-6`.
 */
export function StatCardSkeleton({
  count = 6,
  className,
  gridClassName,
}: StatCardSkeletonProps) {
  return (
    <SkeletonContainer
      className={cn(
        "grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
        gridClassName,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn("rounded-xl border bg-card p-4 space-y-3 h-28", className)}>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-2 w-28" />
        </div>
      ))}
    </SkeletonContainer>
  );
}

// ─── TableSkeleton ───────────────────────────────────────────────────────────

interface TableSkeletonProps {
  /** Jumlah baris skeleton. */
  rows?: number;
  /** Jumlah kolom skeleton. */
  columns?: number;
  className?: string;
}

/**
 * Skeleton tabel desktop — meniru struktur `<table>` nyata.
 * Di mobile (< md) tidak dirender; gunakan `CardListSkeleton` sebagai gantinya.
 */
export function TableSkeleton({
  rows = 6,
  columns = 5,
  className,
}: TableSkeletonProps) {
  return (
    <SkeletonContainer>
      <div className={cn("hidden md:block overflow-x-auto", className)}>
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              {Array.from({ length: columns }).map((_, c) => (
                <th key={c} className="px-4 py-3 text-left">
                  <Skeleton className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: columns }).map((_, c) => (
                  <td key={c} className="px-4 py-3.5">
                    <Skeleton
                      className={cn(
                        "h-3",
                        c === 0 ? "w-36" : c === columns - 1 ? "ml-auto w-16" : "w-24",
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SkeletonContainer>
  );
}

// ─── CardListSkeleton ────────────────────────────────────────────────────────

interface CardListSkeletonProps {
  /** Jumlah item. */
  count?: number;
  className?: string;
}

/**
 * Skeleton daftar kartu — dipakai di mobile sebagai pengganti tabel,
 * atau di halaman yang memang berbentuk kartu (pengumuman, diskusi, kegiatan, dll.).
 */
export function CardListSkeleton({ count = 5, className }: CardListSkeletonProps) {
  return (
    <SkeletonContainer className={cn("divide-y divide-border/60", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 space-y-2.5">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full shrink-0" />
          </div>
        </div>
      ))}
    </SkeletonContainer>
  );
}

// ─── CardGridSkeleton ────────────────────────────────────────────────────────

interface CardGridSkeletonProps {
  count?: number;
  className?: string;
  gridClassName?: string;
}

/**
 * Skeleton untuk grid kartu (kegiatan, pengumuman, bagian, inventaris, dll.).
 * Default: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
 */
export function CardGridSkeleton({
  count = 6,
  className,
  gridClassName,
}: CardGridSkeletonProps) {
  return (
    <SkeletonContainer
      className={cn("grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", gridClassName)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn("rounded-xl border bg-card p-4 space-y-3", className)}>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </SkeletonContainer>
  );
}

// ─── ListItemSkeleton ────────────────────────────────────────────────────────

interface ListItemSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * Skeleton untuk daftar item sederhana (notifikasi, aktivitas, riwayat, dll.).
 */
export function ListItemSkeleton({ count = 5, className }: ListItemSkeletonProps) {
  return (
    <SkeletonContainer className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border bg-card p-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-16 shrink-0" />
        </div>
      ))}
    </SkeletonContainer>
  );
}

// ─── FormSkeleton ────────────────────────────────────────────────────────────

interface FormSkeletonProps {
  fields?: number;
  className?: string;
}

/**
 * Skeleton untuk form (profil, pengaturan, dll.).
 */
export function FormSkeleton({ fields = 4, className }: FormSkeletonProps) {
  return (
    <SkeletonContainer className={cn("space-y-5", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 rounded-md" />
    </SkeletonContainer>
  );
}

// ─── ProfileSkeleton ─────────────────────────────────────────────────────────

interface ProfileSkeletonProps {
  className?: string;
}

/**
 * Skeleton untuk kartu profil pengguna.
 */
export function ProfileSkeleton({ className }: ProfileSkeletonProps) {
  return (
    <SkeletonContainer className={cn("space-y-4", className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full shrink-0" />
        <div className="space-y-2 min-w-0">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
      <div className="rounded-xl border bg-muted/20 divide-y divide-border/50">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </SkeletonContainer>
  );
}

// ─── TableRowsSkeleton (Server-safe, rows-as-tr fragments) ───────────────────

interface TableRowsSkeletonProps {
  rows?: number;
  columns?: number;
  /** Indeks kolom yang lebih lebar (misal: nama/deskripsi). Default: kolom 0. */
  wideColumnIndex?: number;
}

/**
 * Fragment `<tr>` untuk dipakai di dalam `<tbody>` yang sudah ada.
 * Cocok sebagai `fallback` dalam `<Suspense>` di dalam tabel yang sudah dirender.
 */
export function TableRowsSkeleton({
  rows = 6,
  columns = 5,
  wideColumnIndex = 0,
}: TableRowsSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-border/60 last:border-0">
          {Array.from({ length: columns }).map((_, c) => (
            <td key={c} className="px-4 py-3.5">
              <div
                aria-hidden="true"
                className={cn(
                  "h-3 motion-safe:animate-pulse rounded bg-muted",
                  c === wideColumnIndex ? "w-36" : c === columns - 1 ? "ml-auto w-16" : "w-24",
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
