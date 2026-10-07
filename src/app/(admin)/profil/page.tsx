import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getMyProfile } from '@/actions/profil';
import { ProfilManager } from '@/components/profil/profil-manager';
import { Skeleton } from '@/components/ui/skeleton';

async function ProfileAccount() {
  const profile = await getMyProfile();
  if (!profile) redirect('/login');
  return <ProfilManager profile={profile} />;
}

function ProfileAccountSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-5 sm:space-y-6">
      <span className="sr-only">Memuat profil...</span>
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
        <div className="space-y-2 border-b border-border/60 p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-56" />
        </div>
        <div className="flex flex-col items-center gap-5 p-5 sm:flex-row sm:items-start sm:p-6">
          <Skeleton className="h-24 w-24 shrink-0 rounded-full sm:h-28 sm:w-28" />
          <div className="w-full space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-28" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border/70 bg-card p-5 shadow-[0_4px_24px_rgba(0,0,0,0.3)] sm:p-6">
        <Skeleton className="h-4 w-24" />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-5 sm:space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">Kelola informasi dan keamanan akun Anda.</p>
      </section>
      <Suspense fallback={<ProfileAccountSkeleton />}><ProfileAccount /></Suspense>
    </div>
  );
}
