import { redirect } from 'next/navigation';
import { getDiskusis } from '@/actions/diskusi';
import { getPengumumanList } from '@/actions/pengumuman';
import { getPublicTransparencyData } from '@/actions/transparansi';
import { getProfile } from '@/lib/supabase/server';
import { getUsers } from '@/actions/admin-users';
import { getBagianList } from '@/actions/bagian';
import { getCachedPengaturanSistem } from '@/lib/cache/pengaturan';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { KetuaDashboard } from '@/components/dashboard/ketua-dashboard';
import { AnggotaDashboard } from '@/components/dashboard/anggota-dashboard';
import { PwaInstallPrompt } from '@/components/common/pwa-install-prompt';

export default async function DashboardPage() {
  const [profile, diskusis, announcements, summaryData, settings] = await Promise.all([getProfile(), getDiskusis(), getPengumumanList(), getPublicTransparencyData(), getCachedPengaturanSistem()]);

  if (!profile) {
    redirect('/login');
  }

  if (profile.role === 'admin') {
    const [users, bagianList] = await Promise.all([getUsers().catch(() => []), getBagianList().catch(() => [])]);

    return (
      <>
        <PwaInstallPrompt />
        <AdminDashboard profile={profile} summaryData={summaryData} announcements={announcements} diskusis={diskusis} totalUsers={users.length} totalBagian={bagianList.length} settings={settings} />
      </>
    );
  }

  if (profile.role === 'ketua') {
    return (
      <>
        <PwaInstallPrompt />
        <KetuaDashboard profile={profile} summaryData={summaryData} announcements={announcements} diskusis={diskusis} settings={settings} />
      </>
    );
  }

  return (
    <>
      <PwaInstallPrompt />
      <AnggotaDashboard profile={profile} summaryData={summaryData} announcements={announcements} diskusis={diskusis} settings={settings} />
    </>
  );
}
