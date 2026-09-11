import { Suspense } from 'react';
import { getInventarisList, getRiwayatPeminjaman } from '@/actions/inventaris';
import { getProfile } from '@/lib/supabase/server';
import { getCachedPengaturanSistem } from '@/lib/cache/pengaturan';
import { InventarisManager } from '@/components/inventaris/inventaris-manager';
import { InventarisDataBridge } from '@/components/inventaris/inventaris-manager';

export const metadata = {
  title: 'Inventaris & Aset | Manajemen Organisasi',
  description: 'Kelola aset inventaris barang dan riwayat peminjaman karang taruna',
};

function loadInventarisData() {
  return Promise.all([getInventarisList(), getRiwayatPeminjaman(), getProfile(), getCachedPengaturanSistem()]).then(([items, riwayat, profile, settings]) => ({ items, riwayat, profile, settings }));
}

async function InventarisData({ dataPromise }: { dataPromise: ReturnType<typeof loadInventarisData> }) {
  const data = await dataPromise;
  return <InventarisDataBridge data={data} />;
}

export default function InventarisPage() {
  const dataPromise = loadInventarisData();

  return (
    <InventarisManager loading>
      {/* Kerangka halaman dan kontrol dirender langsung; hanya data yang disusulkan. */}
      <Suspense fallback={null}>
        <InventarisData dataPromise={dataPromise} />
      </Suspense>
    </InventarisManager>
  );
}
