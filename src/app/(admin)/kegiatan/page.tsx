import { getKegiatanList } from '@/actions/kegiatan';
import { getProfile } from '@/lib/supabase/server';
import { getCachedBagianOptions } from '@/lib/cache/bagian';
import { KegiatanManager } from '@/components/kegiatan/kegiatan-manager';

export default async function KegiatanPage() {
  const [kegiatanList, bagianList, profile] = await Promise.all([getKegiatanList(), getCachedBagianOptions(), getProfile()]);

  return <KegiatanManager initialKegiatan={kegiatanList} bagianList={bagianList || []} userRole={profile?.role || 'anggota'} currentUserId={profile?.id} currentUserBagianId={profile?.bagian_id} />;
}
