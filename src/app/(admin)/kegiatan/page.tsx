import { getKegiatanList } from '@/actions/kegiatan';
import { createClient, getProfile } from '@/lib/supabase/server';
import { KegiatanManager } from '@/components/kegiatan/kegiatan-manager';

export default async function KegiatanPage() {
  const supabase = await createClient();

  const [kegiatanList, { data: bagianList }, profile] = await Promise.all([getKegiatanList(), supabase.from('bagian').select('id, nama, slug').order('nama'), getProfile()]);

  return <KegiatanManager initialKegiatan={kegiatanList} bagianList={bagianList || []} userRole={profile?.role || 'anggota'} currentUserId={profile?.id} currentUserBagianId={profile?.bagian_id} />;
}
