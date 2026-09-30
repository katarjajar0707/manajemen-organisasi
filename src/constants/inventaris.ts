import { KategoriBarang, KondisiBarang } from '@/actions/inventaris';

export const INVENTARIS_ITEMS_QUERY_KEY = ['inventaris', 'items'] as const;
export const INVENTARIS_RIWAYAT_QUERY_KEY = ['inventaris', 'riwayat'] as const;

export const KATEGORI_OPTIONS: KategoriBarang[] = [
  'Elektronik & Sound',
  'Tenda & Panggung',
  'Meja & Kursi',
  'Logistik & Kebersihan',
  'Olahraga',
  'Lainnya',
];

export const KONDISI_OPTIONS: { value: KondisiBarang; label: string }[] = [
  { value: 'baik', label: 'Baik (Normal)' },
  { value: 'rusak_ringan', label: 'Rusak Ringan' },
  { value: 'rusak_berat', label: 'Rusak Berat' },
];

export interface InventarisFormData {
  nama: string;
  kategori: KategoriBarang;
  jumlah: number;
  satuan: string;
  kondisi: KondisiBarang;
  lokasi: string;
  fotoUrl: string;
  keterangan: string;
}

export const INITIAL_INVENTARIS_FORM: InventarisFormData = {
  nama: '',
  kategori: 'Elektronik & Sound',
  jumlah: 1,
  satuan: 'Unit',
  kondisi: 'baik',
  lokasi: 'Ruang Sekretariat Katar',
  fotoUrl: '',
  keterangan: '',
};
