import { StrukturManager } from '@/components/struktur/struktur-manager';
import { getAgendas } from '@/actions/agenda';
import { getProfile } from '@/lib/supabase/server';
import { getCachedBagianOptions } from '@/lib/cache/bagian';

export default async function StrukturOrganisasiPage() {
  const [agendas, bagianList, profile] = await Promise.all([getAgendas(), getCachedBagianOptions(), getProfile()]);

  return <StrukturManager initialAgendas={agendas} bagianList={bagianList || []} userRole={profile?.role || 'anggota'} />;
}
