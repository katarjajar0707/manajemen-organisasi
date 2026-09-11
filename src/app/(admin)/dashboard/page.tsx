import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/supabase/server';
import { KetuaDashboard } from '@/components/dashboard/ketua-dashboard';
import {
  AnggotaDashboardDataSkeleton,
  AnggotaDashboardDiscussions,
  AnggotaDashboardProfile,
  AnggotaDashboardSchedule,
  AnggotaDashboardShell,
  AnggotaDashboardSummary,
} from '@/components/dashboard/anggota-dashboard';
import {
  AdminDashboardShell,
  AdminDashboardStats,
  AdminDashboardAnnouncements,
  AdminDashboardOrganization,
  AdminDashboardFinance,
  AdminDashboardActivity,
  AdminDashboardSchedule,
  DashboardSectionSkeleton,
} from '@/components/dashboard/admin-dashboard';

async function DashboardContent() {
  const profile = await getProfile();

  if (!profile) {
    redirect('/login');
  }

  if (profile.role !== 'admin') {
    if (profile.role === 'ketua') {
      const { getDiskusis } = await import('@/actions/diskusi');
      const { getPengumumanList } = await import('@/actions/pengumuman');
      const { getCachedPengaturanSistem } = await import('@/lib/cache/pengaturan');
      const { getCachedPublicTransparencyData } = await import('@/lib/cache/transparansi');
      const [diskusis, announcements, summaryData, settings] = await Promise.all([getDiskusis(), getPengumumanList(), getCachedPublicTransparencyData(), getCachedPengaturanSistem()]);
      return <KetuaDashboard profile={profile} summaryData={summaryData} announcements={announcements} diskusis={diskusis} settings={settings} />;
    }

    return (
      <AnggotaDashboardShell profile={profile}>
        <Suspense fallback={<AnggotaDashboardDataSkeleton variant="summary" />}>
          <AnggotaDashboardSummary />
        </Suspense>
        <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
          <AnggotaDashboardProfile profile={profile} />
          <Suspense fallback={<AnggotaDashboardDataSkeleton variant="schedule" />}>
            <AnggotaDashboardSchedule />
          </Suspense>
        </div>
        <Suspense fallback={<AnggotaDashboardDataSkeleton variant="discussion" />}>
          <AnggotaDashboardDiscussions />
        </Suspense>
      </AnggotaDashboardShell>
    );
  }

  return (
    <AdminDashboardShell profile={profile}>
      <Suspense fallback={<DashboardSectionSkeleton variant="stats" />}>
        <AdminDashboardStats />
      </Suspense>
      <Suspense fallback={<DashboardSectionSkeleton variant="list" />}>
        <AdminDashboardAnnouncements profile={profile} />
      </Suspense>
      <Suspense fallback={<DashboardSectionSkeleton variant="organization" />}>
        <AdminDashboardOrganization />
      </Suspense>
      <div className="grid gap-6 lg:grid-cols-5">
        <Suspense fallback={<DashboardSectionSkeleton variant="card" className="lg:col-span-2" />}>
          <AdminDashboardFinance />
        </Suspense>
        <Suspense fallback={<DashboardSectionSkeleton variant="list" className="lg:col-span-3" />}>
          <AdminDashboardActivity />
        </Suspense>
      </div>
      <Suspense fallback={<DashboardSectionSkeleton variant="schedule" />}>
        <AdminDashboardSchedule />
      </Suspense>
    </AdminDashboardShell>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
