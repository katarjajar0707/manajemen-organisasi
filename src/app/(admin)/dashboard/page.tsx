import { redirect } from 'next/navigation';
import { getDiskusis } from '@/actions/diskusi';
import { getPengumumanList } from '@/actions/pengumuman';
import { getProfile } from '@/lib/supabase/server';
import { getUsers } from '@/actions/admin-users';
import { getBagianList } from '@/actions/bagian';
import { getCachedPengaturanSistem } from '@/lib/cache/pengaturan';
import { getCachedPublicTransparencyData } from '@/lib/cache/transparansi';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { KetuaDashboard } from '@/components/dashboard/ketua-dashboard';
import { AnggotaDashboard } from '@/components/dashboard/anggota-dashboard';

export default async function DashboardPage() {
  const [profile, diskusis, announcements, summaryData, settings] = await Promise.all([getProfile(), getDiskusis(), getPengumumanList(), getCachedPublicTransparencyData(), getCachedPengaturanSistem()]);

  if (!profile) {
    redirect('/login');
  }

  if (profile.role === 'admin') {
    const [users, bagianList] = await Promise.all([getUsers().catch(() => []), getBagianList().catch(() => [])]);

    return (
      <>
        <AdminDashboard profile={profile} summaryData={summaryData} announcements={announcements} diskusis={diskusis} totalUsers={users.length} totalBagian={bagianList.length} settings={settings} />
      </>
    );
  }

  if (profile.role === 'ketua') {
    return (
      <>
        <KetuaDashboard profile={profile} summaryData={summaryData} announcements={announcements} diskusis={diskusis} settings={settings} />
      </>
    );
  }

  return (
    <>
      <AnggotaDashboard profile={profile} summaryData={summaryData} announcements={announcements} diskusis={diskusis} settings={settings} />
    </>
  );
}
