import { getProfile } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function BendaharaLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  const canAccessBendahara = profile?.bagian?.slug === 'bendahara' || profile?.role === 'admin' || profile?.role === 'ketua';

  // Modul dan catatan kas merupakan ruang kerja Bendahara dengan akses pengawasan Admin/Ketua.
  if (!canAccessBendahara) {
    redirect('/dashboard');
  }

  return children;
}
