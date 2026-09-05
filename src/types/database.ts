export type UserRole = "admin" | "ketua" | "anggota";

export interface Bagian {
  id: string;
  nama: string;
  slug: string;
  deskripsi?: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  nama: string;
  username: string;
  foto_url?: string | null;
  bio?: string | null;
  bagian_id?: string | null;
  role: UserRole;
  created_at: string;
  bagian?: Bagian | null;
}

export interface Catatan {
  id: string;
  bagian_id: string;
  judul: string;
  isi: string;
  tanggal: string;
  lampiran_url?: string | null;
  dibuat_oleh: string;
  created_at: string;
  deleted_at?: string | null;
  author?: Profile;
}

export interface CatatanKeuangan {
  id: string;
  bagian_id: string;
  jenis: "masuk" | "keluar";
  judul: string;
  keterangan: string;
  jumlah: number;
  tanggal: string;
  lampiran_url?: string | null;
  dibuat_oleh: string;
  created_at: string;
  deleted_at?: string | null;
  author?: Profile;
}

export interface AgendaOrganisasi {
  id: string;
  bagian_id: string;
  nama_agenda: string;
  deskripsi?: string | null;
  dibuat_oleh: string;
  created_at: string;
  bagian?: Bagian;
}

export interface PeriodeKepengurusan {
  id: string;
  agenda_organisasi_id: string;
  nama_periode: string;
  tanggal_mulai: string;
  tanggal_selesai?: string | null;
  is_aktif: boolean;
  created_at: string;
  agenda?: AgendaOrganisasi;
}

export interface Anggota {
  id: string;
  nama: string;
  kontak: string;
  rt_rw: string;
  jabatan: string;
  periode_id: string;
  foto_url?: string | null;
  created_at: string;
  periode?: PeriodeKepengurusan;
}

export interface KalenderKegiatan {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal_mulai: string;
  tanggal_selesai?: string | null;
  lokasi?: string | null;
  bagian_id?: string | null;
  dibuat_oleh: string;
  created_at: string;
  bagian?: Bagian | null;
}

export interface DokumentasiKegiatan {
  id: string;
  kalender_id: string;
  foto_url: string;
  caption?: string | null;
  created_at: string;
}

export interface Pengumuman {
  id: string;
  judul: string;
  isi: string;
  target: "semua" | "bagian_tertentu";
  bagian_id?: string | null;
  dibuat_oleh: string;
  created_at: string;
  bagian?: Bagian | null;
}

export interface Diskusi {
  id: string;
  tipe: "diskusi" | "catatan_umum";
  judul: string;
  isi?: string | null;
  bagian_pembuat_id: string;
  dibuat_oleh: string;
  created_at: string;
  author?: Profile;
  bagian_pembuat?: Bagian;
  mentions?: DiskusiMention[];
}

export interface DiskusiBalasan {
  id: string;
  diskusi_id: string;
  isi: string;
  dibuat_oleh: string;
  created_at: string;
  author?: Profile;
}

export interface DiskusiMention {
  id: string;
  diskusi_id: string;
  bagian_ditag_id: string;
  created_at: string;
  bagian_ditag?: Bagian;
}

export interface Inventaris {
  id: string;
  nama_barang: string;
  jumlah: number;
  kondisi: "baik" | "rusak_ringan" | "rusak_berat";
  foto_url?: string | null;
  created_at: string;
}

export interface PeminjamanInventaris {
  id: string;
  inventaris_id: string;
  peminjam: string;
  tanggal_pinjam: string;
  tanggal_kembali_rencana: string;
  tanggal_kembali_aktual?: string | null;
  status: "dipinjam" | "dikembalikan";
  dibuat_oleh: string;
  inventaris?: Inventaris;
}

export interface TemplateSurat {
  id: string;
  nama_template: string;
  jenis: "keluar" | "masuk" | "proposal" | "undangan";
  isi_template: string;
  created_at: string;
}

export interface ArsipDokumen {
  id: string;
  judul: string;
  kategori: "sk" | "proposal" | "lpj" | "lainnya";
  file_url: string;
  agenda_organisasi_id?: string | null;
  dibuat_oleh: string;
  created_at: string;
  agenda?: AgendaOrganisasi | null;
}
