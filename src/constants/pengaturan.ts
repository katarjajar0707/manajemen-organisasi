import { ProfilOrganisasi, OperasionalKebijakan, KeamananSistem } from '@/actions/pengaturan';

export const DEFAULT_PROFIL_ORGANISASI: ProfilOrganisasi = {
  nama: 'Karang Taruna Tunas Harapan',
  unitWilayah: 'Sub-Unit RT 04 / RW 03',
  kelurahan: 'Kelurahan Sukamaju',
  kecamatan: 'Kecamatan Pancoran',
  kota: 'Jakarta Selatan',
  slogan: 'Pemuda Bersatu, Lingkungan Tangguh dan Berbudaya',
  alamat: 'Balai Warga RW 03, Jl. Flamboyan No. 12',
  email: 'sekretariat.kt03@gmail.com',
  telepon: '+62 812-3456-7890',
  instagram: '@karangtaruna_rw03',
  tiktok: '',
  logoUrl: null,
};

export const DEFAULT_OPERASIONAL: OperasionalKebijakan = {
  periodeAktif: '2025 - 2027',
  tglMulaiPeriode: '2025-01-01',
  tglSelesaiPeriode: '2027-12-31',
  formatNomorSurat: '{NOMOR}/KT-03/{BULAN}/{TAHUN}',
  maxHariPinjamInventaris: '3',
  wajibPersetujuanKetua: true,
  maxPengeluaranTanpaNota: '50000',
  notifPengeluaranBesar: true,
  batasNotifPengeluaran: '1000000',
};

export const DEFAULT_KEAMANAN: KeamananSistem = {
  modePendaftaran: 'invite_only',
  sessionTimeoutMinutes: '10080',
  portalPublikAktif: true,
  transparansiKasPublik: true,
  modeMaintenance: false,
  wajibDuaFaktorAdmin: false,
  izinkanAnggotaBuatPengumuman: false,
};
