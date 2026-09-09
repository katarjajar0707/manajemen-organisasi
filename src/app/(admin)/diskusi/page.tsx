import { getDiskusis } from '@/actions/diskusi';
import { getProfile } from '@/lib/supabase/server';
import { getCachedBagianOptions } from '@/lib/cache/bagian';
import { DiskusiManager } from '@/components/diskusi/diskusi-manager';

export default async function DiskusiPage() {
  const [initialThreads, bagianList, profile] = await Promise.all([getDiskusis(), getCachedBagianOptions(), getProfile()]);

  return <DiskusiManager initialThreads={initialThreads} bagianList={bagianList || []} userRole={profile?.role || 'anggota'} currentUserId={profile?.id} currentUserBagianId={profile?.bagian_id} />;
}
