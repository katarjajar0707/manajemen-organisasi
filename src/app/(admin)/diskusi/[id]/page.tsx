import { getDiskusiById, getDiskusiBalasans } from '@/actions/diskusi';
import { getProfile } from '@/lib/supabase/server';
import { getCachedBagianOptions } from '@/lib/cache/bagian';
import { DiskusiDetailManager } from '@/components/diskusi/diskusi-detail-manager';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ThreadDiskusiDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [thread, replies, bagianList, profile] = await Promise.all([getDiskusiById(id), getDiskusiBalasans(id), getCachedBagianOptions(), getProfile()]);

  if (!thread) {
    notFound();
  }

  return <DiskusiDetailManager initialThread={thread} initialReplies={replies} bagianList={bagianList || []} currentUserId={profile?.id} userRole={profile?.role || 'anggota'} currentUserBagianId={profile?.bagian_id} />;
}
