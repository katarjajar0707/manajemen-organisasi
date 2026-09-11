import { getCatatanList } from '@/actions/catatan';
import { BagianCatatanManager } from '@/components/bagian/bagian-catatan-manager';
import { getProfile } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Catatan Bagian | Manajemen Organisasi',
  description: 'Catatan internal yang hanya tersedia untuk anggota bagian masing-masing.',
};

export default async function CatatanPage() {
  const profile = await getProfile();

  if (!profile?.bagian) redirect('/dashboard');

  const catatanList = await getCatatanList();

  return <BagianCatatanManager bagianNama={profile.bagian.nama} initialCatatan={catatanList} />;
}
