import { getNotifikasi } from '@/actions/notifikasi';
import { NotifikasiManager } from '@/components/notifikasi/notifikasi-manager';

export default async function NotifikasiPage() {
  const notifications = await getNotifikasi();
  return <NotifikasiManager initialNotifications={notifications} />;
}
