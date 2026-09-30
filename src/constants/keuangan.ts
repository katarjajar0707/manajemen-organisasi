import type { ReactNode } from 'react';
import type { PengaturanSistemData } from '@/actions/pengaturan';

export interface TransaksiAuthor {
  nama: string;
  role: string;
}

export interface Transaksi {
  id: string;
  judul: string;
  keterangan: string;
  kategori?: string;
  displayKeterangan?: string;
  jenis: 'masuk' | 'keluar';
  jumlah: number;
  tanggal: string;
  created_at?: string;
  lampiran_url: string | null;
  kegiatan_id?: string | null;
  author?: TransaksiAuthor;
}

export interface BendaharaSaldo {
  masuk: number;
  keluar: number;
  sisa: number;
}

export interface BendaharaManagerProps {
  initialList?: Transaksi[];
  initialSaldo: BendaharaSaldo;
  bagianId?: string | null;
  agendaCategories?: string[];
  settings?: PengaturanSistemData;
  canManage?: boolean;
  children?: ReactNode;
}

export interface BendaharaData {
  list: Transaksi[];
  saldo: BendaharaSaldo;
  bagianId: string | null;
  categories: string[];
  settings: PengaturanSistemData;
}

export const KEUANGAN_QUERY_KEY = ['keuangan', 'bendahara'] as const;

export function formatRupiahCached(angka: number | string) {
  const num = Math.round(Number(angka) || 0);
  return `Rp ${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

export interface RawTransactionRecord {
  id: string;
  judul?: string;
  keterangan?: string | null;
  kategori?: string | null;
  jenis: 'masuk' | 'keluar';
  jumlah: number | string;
  tanggal?: string | null;
  created_at?: string;
  lampiran_url?: string | null;
  kegiatan_id?: string | null;
  bagian_id?: string | null;
  dibuat_oleh?: string | null;
  author?: TransaksiAuthor | TransaksiAuthor[] | null;
}

export function normalizeTransaction(item: RawTransactionRecord): Transaksi {
  let kategori = 'Kas General';
  let displayKeterangan = item.keterangan || '';
  const match = (item.keterangan || '').match(/^\[Kategori:\s*([^\]]+)\]/i);
  if (match) {
    kategori = match[1].trim();
    displayKeterangan = (item.keterangan || '').replace(/^\[Kategori:\s*[^\]]+\]\s*/i, '').trim();
  } else if (item.kategori) {
    kategori = item.kategori;
  }
  const authorObj = Array.isArray(item.author) ? item.author[0] : item.author;
  return {
    id: item.id,
    judul: item.judul || '',
    keterangan: item.keterangan || '',
    jenis: item.jenis,
    jumlah: Number(item.jumlah) || 0,
    tanggal: item.tanggal || item.created_at || '',
    created_at: item.created_at,
    lampiran_url: item.lampiran_url || null,
    author: authorObj || undefined,
    kategori,
    displayKeterangan,
    kegiatan_id: item.kegiatan_id || null,
  };
}

export function formatTanggalLaporan(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
