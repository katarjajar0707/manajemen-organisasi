import { notFound } from 'next/navigation';
import { getProfile } from '@/lib/supabase/server';
import { getCachedBagianBySlug } from '@/lib/cache/bagian';
import { getAgendas } from '@/actions/agenda';
import { BagianAgendaManager } from '@/components/struktur/bagian-agenda-manager';

interface PageProps {
  params: Promise<{
    bagian: string;
  }>;
}

export default async function KelolaAgendaBagianPage({ params }: PageProps) {
  const { bagian: slug } = await params;
  const [bagianData, profile, agendas] = await Promise.all([getCachedBagianBySlug(slug), getProfile(), getAgendas(slug)]);

  if (!bagianData) {
    notFound();
  }

  return <BagianAgendaManager bagian={bagianData} initialAgendas={agendas} userRole={profile?.role || 'anggota'} />;
}
