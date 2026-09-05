export interface KegiatanAktif {
  id: string;
  judul: string;
  namaSingkat: string;
  durasiLabel: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  anggaranTotal: number;
  anggaranTerpakai: number;
  danaMasuk: number;
  sisaAnggaran: number;
  status: "Berlangsung" | "Mendatang" | "Selesai";
  penanggungJawab: string;
  lokasi: string;
  deskripsi: string;
}

export const CURRENT_ONGOING_KEGIATAN: KegiatanAktif = {
  id: "hut-ri-81",
  judul: "Festival Semarak HUT RI ke-81 & Bulan Kemerdekaan",
  namaSingkat: "HUT RI ke-81",
  durasiLabel: "Durasi 1 Bulan (17 Agu – 17 Sep 2026)",
  tanggalMulai: "2026-08-17",
  tanggalSelesai: "2026-09-17",
  anggaranTotal: 8500000,
  danaMasuk: 5200000,
  anggaranTerpakai: 3150000,
  sisaAnggaran: 2050000,
  status: "Berlangsung",
  penanggungJawab: "Panitia HUT RI (Ketua & Acara)",
  lokasi: "Balai Warga & Lapangan RW 05",
  deskripsi:
    "Rangkaian perayaan kemerdekaan 1 bulan penuh mencakup perlombaan warga antar-RT, panggung kreasi seni pemuda, bazar UMKM, dan malam syukuran puncak.",
};

// Transaksi khusus kegiatan berjalan (Event HUT RI)
export const TRANSAKSI_KEGIATAN_BERJALAN = [
  {
    id: "kb-1",
    jenis: "masuk" as const,
    judul: "Sponsor Utama Toko Berkah Mandiri",
    nominal: 1500000,
    nominalFormatted: "Rp 1.500.000",
    kategori: "Sponsor / Donatur",
    tanggal: "18 Agu 2026",
    keterangan: "Bantuan dana tunai untuk doorprize jalan santai",
    bukti: true,
  },
  {
    id: "kb-2",
    jenis: "masuk" as const,
    judul: "Iuran Swadaya Warga RT 01 - RT 06",
    nominal: 2400000,
    nominalFormatted: "Rp 2.400.000",
    kategori: "Swadaya Warga",
    tanggal: "22 Agu 2026",
    keterangan: "Kontribusi partisipasi masing-masing Rp 400.000 per RT",
    bukti: true,
  },
  {
    id: "kb-3",
    jenis: "masuk" as const,
    judul: "Uang Pendaftaran Lomba Futsal & Voli",
    nominal: 1300000,
    nominalFormatted: "Rp 1.300.000",
    kategori: "Pendaftaran Lomba",
    tanggal: "25 Agu 2026",
    keterangan: "Pendaftaran 13 tim pemuda antar RT @ Rp 100.000",
    bukti: true,
  },
  {
    id: "kb-4",
    jenis: "keluar" as const,
    judul: "DP Sewa Tenda & Panggung Kemerdekaan",
    nominal: 1200000,
    nominalFormatted: "Rp 1.200.000",
    kategori: "Peralatan & Panggung",
    tanggal: "24 Agu 2026",
    keterangan: "Uang muka tenda ukuran 8x12 meter untuk panggung utama",
    bukti: true,
  },
  {
    id: "kb-5",
    jenis: "keluar" as const,
    judul: "Belanja Hadiah & Piala Lomba Anak-Anak",
    nominal: 1450000,
    nominalFormatted: "Rp 1.450.000",
    kategori: "Hadiah & Perlengkapan",
    tanggal: "28 Agu 2026",
    keterangan: "Piala juara 1-3 untuk 8 kategori lomba + alat tulis hadiah",
    bukti: true,
  },
  {
    id: "kb-6",
    jenis: "keluar" as const,
    judul: "Konsumsi Rapat Panitia Teknis Lapangan",
    nominal: 500000,
    nominalFormatted: "Rp 500.000",
    kategori: "Konsumsi",
    tanggal: "02 Sep 2026",
    keterangan: "Snack & makan malam 25 orang panitia gladi bersih",
    bukti: true,
  },
];

// Laporan kegiatan lainnya (Event yang sudah selesai/lampau)
export const LAPORAN_KEGIATAN_LAINNYA = [
  {
    id: "lap-1",
    namaKegiatan: "Bakti Sosial Pembagian Sembako Ramadhan",
    periode: "Maret 2026",
    totalDanaMasuk: "Rp 6.800.000",
    totalPengeluaran: "Rp 6.650.000",
    sisaDana: "Rp 150.000 (Dialihkan ke Kas Umum)",
    statusLPJ: "LPJ Selesai & Disetujui RW",
    pj: "Siti Rahma (Bendahara)",
  },
  {
    id: "lap-2",
    namaKegiatan: "Turnamen Futsal Pemuda Antar RW",
    periode: "Mei 2026",
    totalDanaMasuk: "Rp 3.500.000",
    totalPengeluaran: "Rp 3.420.000",
    sisaDana: "Rp 80.000 (Kas Operasional Olahraga)",
    statusLPJ: "LPJ Selesai & Terverifikasi",
    pj: "Fajar Nugraha (Olahraga)",
  },
  {
    id: "lap-3",
    namaKegiatan: "Pelatihan Digital Marketing & Wirausaha Muda",
    periode: "Juli 2026",
    totalDanaMasuk: "Rp 2.200.000",
    totalPengeluaran: "Rp 2.150.000",
    sisaDana: "Rp 50.000",
    statusLPJ: "LPJ Selesai",
    pj: "Kominfo & Humas",
  },
];
