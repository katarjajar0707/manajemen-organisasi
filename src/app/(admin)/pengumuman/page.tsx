import { getPengumumanList } from '@/actions/pengumuman';
import { getProfile } from '@/lib/supabase/server';
import { getCachedBagianOptions } from '@/lib/cache/bagian';
import { PengumumanManager } from '@/components/pengumuman/pengumuman-manager';

export default async function PengumumanPage() {
  const [announcements, bagianList, profile] = await Promise.all([getPengumumanList(), getCachedBagianOptions(), getProfile()]);

  return <PengumumanManager initialAnnouncements={announcements} bagianList={bagianList || []} currentUserId={profile?.id} userRole={profile?.role || 'anggota'} currentUserBagianId={profile?.bagian_id} />;
}
