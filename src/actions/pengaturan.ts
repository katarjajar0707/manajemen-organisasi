"use server";

import { createClient, createAdminClient, getProfile } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ProfilOrganisasi {
  nama: string;
  unitWilayah: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  slogan: string;
  alamat: string;
  email: string;
  telepon: string;
  instagram: string;
  logoUrl?: string | null;
}

export interface OperasionalKebijakan {
  periodeAktif: string;
  tglMulaiPeriode: string;
  tglSelesaiPeriode: string;
  formatNomorSurat: string;
  maxHariPinjamInventaris: string;
  wajibPersetujuanKetua: boolean;
  maxPengeluaranTanpaNota: string;
  notifPengeluaranBesar: boolean;
  batasNotifPengeluaran: string;
}

export interface KeamananSistem {
  modePendaftaran: string;
  sessionTimeoutMinutes: string;
  portalPublikAktif: boolean;
  transparansiKasPublik: boolean;
  modeMaintenance: boolean;
  wajibDuaFaktorAdmin: boolean;
  izinkanAnggotaBuatPengumuman: boolean;
}

export interface PengaturanSistemData {
  profil: ProfilOrganisasi;
  operasional: OperasionalKebijakan;
  keamanan: KeamananSistem;
  tableExists: boolean;
}

const DEFAULT_PENGATURAN: PengaturanSistemData = {
  profil: {
    nama: "Karang Taruna Tunas Harapan",
    unitWilayah: "Sub-Unit RT 04 / RW 03",
    kelurahan: "Kelurahan Sukamaju",
    kecamatan: "Kecamatan Pancoran",
    kota: "Jakarta Selatan",
    slogan: "Pemuda Bersatu, Lingkungan Tangguh dan Berbudaya",
    alamat: "Balai Warga RW 03, Jl. Flamboyan No. 12",
    email: "sekretariat.kt03@gmail.com",
    telepon: "+62 812-3456-7890",
    instagram: "@karangtaruna_rw03",
    logoUrl: null,
  },
  operasional: {
    periodeAktif: "2025 - 2027",
    tglMulaiPeriode: "2025-01-01",
    tglSelesaiPeriode: "2027-12-31",
    formatNomorSurat: "{NOMOR}/KT-03/{BULAN}/{TAHUN}",
    maxHariPinjamInventaris: "3",
    wajibPersetujuanKetua: true,
    maxPengeluaranTanpaNota: "50000",
    notifPengeluaranBesar: true,
    batasNotifPengeluaran: "1000000",
  },
  keamanan: {
    modePendaftaran: "invite_only",
    sessionTimeoutMinutes: "60",
    portalPublikAktif: true,
    transparansiKasPublik: true,
    modeMaintenance: false,
    wajibDuaFaktorAdmin: false,
    izinkanAnggotaBuatPengumuman: false,
  },
  tableExists: true,
};

/**
 * Mengambil seluruh data pengaturan sistem dari database Supabase
 */
export async function getPengaturanSistem(): Promise<PengaturanSistemData> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("pengaturan_sistem")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (error) {
      // Jika tabel belum dibuat di database, kembalikan default dengan flag tableExists: false
      const errorMsg = error.message?.toLowerCase() || "";
      if (errorMsg.includes("does not exist") || error.code === "42P01") {
        console.warn("Tabel pengaturan_sistem belum ada di database.");
        return { ...DEFAULT_PENGATURAN, tableExists: false };
      }
      console.error("Error fetching pengaturan_sistem:", error);
      return DEFAULT_PENGATURAN;
    }

    if (!data) {
      // Jika tabel ada tapi belum ada baris 'default', coba buat dengan admin client
      try {
        const adminSupabase = await createAdminClient();
        await adminSupabase.from("pengaturan_sistem").insert({ id: "default" });
      } catch (insertErr) {
        console.warn("Could not insert default pengaturan:", insertErr);
      }
      return DEFAULT_PENGATURAN;
    }

    return {
      profil: {
        nama: data.nama || DEFAULT_PENGATURAN.profil.nama,
        unitWilayah: data.unit_wilayah || DEFAULT_PENGATURAN.profil.unitWilayah,
        kelurahan: data.kelurahan || DEFAULT_PENGATURAN.profil.kelurahan,
        kecamatan: data.kecamatan || DEFAULT_PENGATURAN.profil.kecamatan,
        kota: data.kota || DEFAULT_PENGATURAN.profil.kota,
        slogan: data.slogan || DEFAULT_PENGATURAN.profil.slogan,
        alamat: data.alamat || DEFAULT_PENGATURAN.profil.alamat,
        email: data.email || DEFAULT_PENGATURAN.profil.email,
        telepon: data.telepon || DEFAULT_PENGATURAN.profil.telepon,
        instagram: data.instagram || DEFAULT_PENGATURAN.profil.instagram,
        logoUrl: data.logo_url || null,
      },
      operasional: {
        periodeAktif: data.periode_aktif || DEFAULT_PENGATURAN.operasional.periodeAktif,
        tglMulaiPeriode: data.tgl_mulai_periode || DEFAULT_PENGATURAN.operasional.tglMulaiPeriode,
        tglSelesaiPeriode: data.tgl_selesai_periode || DEFAULT_PENGATURAN.operasional.tglSelesaiPeriode,
        formatNomorSurat: data.format_nomor_surat || DEFAULT_PENGATURAN.operasional.formatNomorSurat,
        maxHariPinjamInventaris: String(data.max_hari_pinjam_inventaris ?? DEFAULT_PENGATURAN.operasional.maxHariPinjamInventaris),
        wajibPersetujuanKetua: data.wajib_persetujuan_ketua ?? DEFAULT_PENGATURAN.operasional.wajibPersetujuanKetua,
        maxPengeluaranTanpaNota: String(data.max_pengeluaran_tanpa_nota ?? DEFAULT_PENGATURAN.operasional.maxPengeluaranTanpaNota),
        notifPengeluaranBesar: data.notif_pengeluaran_besar ?? DEFAULT_PENGATURAN.operasional.notifPengeluaranBesar,
        batasNotifPengeluaran: String(data.batas_notif_pengeluaran ?? DEFAULT_PENGATURAN.operasional.batasNotifPengeluaran),
      },
      keamanan: {
        modePendaftaran: data.mode_pendaftaran || DEFAULT_PENGATURAN.keamanan.modePendaftaran,
        sessionTimeoutMinutes: String(data.session_timeout_minutes ?? DEFAULT_PENGATURAN.keamanan.sessionTimeoutMinutes),
        portalPublikAktif: data.portal_publik_aktif ?? DEFAULT_PENGATURAN.keamanan.portalPublikAktif,
        transparansiKasPublik: data.transparansi_kas_publik ?? DEFAULT_PENGATURAN.keamanan.transparansiKasPublik,
        modeMaintenance: data.mode_maintenance ?? DEFAULT_PENGATURAN.keamanan.modeMaintenance,
        wajibDuaFaktorAdmin: data.wajib_dua_faktor_admin ?? DEFAULT_PENGATURAN.keamanan.wajibDuaFaktorAdmin,
        izinkanAnggotaBuatPengumuman: data.izinkan_anggota_buat_pengumuman ?? DEFAULT_PENGATURAN.keamanan.izinkanAnggotaBuatPengumuman,
      },
      tableExists: true,
    };
  } catch (err) {
    console.error("Critical error in getPengaturanSistem:", err);
    return DEFAULT_PENGATURAN;
  }
}

/**
 * Menyimpan data Profil Organisasi (Nama, Logo, Alamat, Kontak, dll.)
 */
export async function updatePengaturanProfil(
  payload: Partial<ProfilOrganisasi>
): Promise<{ success: boolean; error?: string }> {
  try {
    const profile = await getProfile();
    if (!profile) return { success: false, error: "Silakan login terlebih dahulu." };
    if (profile.role !== "admin" && profile.role !== "ketua") {
      return { success: false, error: "Hanya role Admin atau Ketua yang berhak mengubah pengaturan." };
    }

    const adminSupabase = await createAdminClient();

    const dbPayload: Record<string, any> = {
      id: "default",
      updated_at: new Date().toISOString(),
    };

    if (payload.nama !== undefined) dbPayload.nama = payload.nama.trim();
    if (payload.unitWilayah !== undefined) dbPayload.unit_wilayah = payload.unitWilayah.trim();
    if (payload.kelurahan !== undefined) dbPayload.kelurahan = payload.kelurahan.trim();
    if (payload.kecamatan !== undefined) dbPayload.kecamatan = payload.kecamatan.trim();
    if (payload.kota !== undefined) dbPayload.kota = payload.kota.trim();
    if (payload.slogan !== undefined) dbPayload.slogan = payload.slogan.trim();
    if (payload.alamat !== undefined) dbPayload.alamat = payload.alamat.trim();
    if (payload.email !== undefined) dbPayload.email = payload.email.trim();
    if (payload.telepon !== undefined) dbPayload.telepon = payload.telepon.trim();
    if (payload.instagram !== undefined) dbPayload.instagram = payload.instagram.trim();
    if (payload.logoUrl !== undefined) dbPayload.logo_url = payload.logoUrl;

    const { error } = await adminSupabase
      .from("pengaturan_sistem")
      .upsert(dbPayload, { onConflict: "id" });

    if (error) {
      if (error.message?.includes("does not exist") || error.code === "42P01") {
        return {
          success: false,
          error: "Tabel 'pengaturan_sistem' belum dibuat. Silakan jalankan file migrasi '010_phase11_pengaturan_sistem.sql' di Supabase SQL Editor.",
        };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/pengaturan");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan server saat menyimpan profil." };
  }
}

/**
 * Menyimpan data Operasional & Kebijakan Organisasi
 */
export async function updatePengaturanOperasional(
  payload: Partial<OperasionalKebijakan>
): Promise<{ success: boolean; error?: string }> {
  try {
    const profile = await getProfile();
    if (!profile) return { success: false, error: "Silakan login terlebih dahulu." };
    if (profile.role !== "admin" && profile.role !== "ketua") {
      return { success: false, error: "Hanya role Admin atau Ketua yang berhak mengubah operasional." };
    }

    const adminSupabase = await createAdminClient();

    const dbPayload: Record<string, any> = {
      id: "default",
      updated_at: new Date().toISOString(),
    };

    if (payload.periodeAktif !== undefined) dbPayload.periode_aktif = payload.periodeAktif.trim();
    if (payload.tglMulaiPeriode !== undefined) dbPayload.tgl_mulai_periode = payload.tglMulaiPeriode || null;
    if (payload.tglSelesaiPeriode !== undefined) dbPayload.tgl_selesai_periode = payload.tglSelesaiPeriode || null;
    if (payload.formatNomorSurat !== undefined) dbPayload.format_nomor_surat = payload.formatNomorSurat.trim();
    if (payload.maxHariPinjamInventaris !== undefined) {
      dbPayload.max_hari_pinjam_inventaris = parseInt(payload.maxHariPinjamInventaris) || 3;
    }
    if (payload.wajibPersetujuanKetua !== undefined) {
      dbPayload.wajib_persetujuan_ketua = payload.wajibPersetujuanKetua;
    }
    if (payload.maxPengeluaranTanpaNota !== undefined) {
      dbPayload.max_pengeluaran_tanpa_nota = parseFloat(payload.maxPengeluaranTanpaNota) || 50000;
    }
    if (payload.notifPengeluaranBesar !== undefined) {
      dbPayload.notif_pengeluaran_besar = payload.notifPengeluaranBesar;
    }
    if (payload.batasNotifPengeluaran !== undefined) {
      dbPayload.batas_notif_pengeluaran = parseFloat(payload.batasNotifPengeluaran) || 1000000;
    }

    const { error } = await adminSupabase
      .from("pengaturan_sistem")
      .upsert(dbPayload, { onConflict: "id" });

    if (error) {
      if (error.message?.includes("does not exist") || error.code === "42P01") {
        return {
          success: false,
          error: "Tabel 'pengaturan_sistem' belum dibuat. Silakan jalankan file migrasi '010_phase11_pengaturan_sistem.sql' di Supabase SQL Editor.",
        };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/pengaturan");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan server saat menyimpan operasional." };
  }
}

/**
 * Menyimpan data Akses & Keamanan Sistem
 */
export async function updatePengaturanKeamanan(
  payload: Partial<KeamananSistem>
): Promise<{ success: boolean; error?: string }> {
  try {
    const profile = await getProfile();
    if (!profile) return { success: false, error: "Silakan login terlebih dahulu." };
    if (profile.role !== "admin" && profile.role !== "ketua") {
      return { success: false, error: "Hanya role Admin atau Ketua yang berhak mengubah keamanan." };
    }

    const adminSupabase = await createAdminClient();

    const dbPayload: Record<string, any> = {
      id: "default",
      updated_at: new Date().toISOString(),
    };

    if (payload.modePendaftaran !== undefined) dbPayload.mode_pendaftaran = payload.modePendaftaran;
    if (payload.sessionTimeoutMinutes !== undefined) {
      dbPayload.session_timeout_minutes = payload.sessionTimeoutMinutes;
    }
    if (payload.portalPublikAktif !== undefined) dbPayload.portal_publik_aktif = payload.portalPublikAktif;
    if (payload.transparansiKasPublik !== undefined) {
      dbPayload.transparansi_kas_publik = payload.transparansiKasPublik;
    }
    if (payload.modeMaintenance !== undefined) dbPayload.mode_maintenance = payload.modeMaintenance;
    if (payload.wajibDuaFaktorAdmin !== undefined) {
      dbPayload.wajib_dua_faktor_admin = payload.wajibDuaFaktorAdmin;
    }
    if (payload.izinkanAnggotaBuatPengumuman !== undefined) {
      dbPayload.izinkan_anggota_buat_pengumuman = payload.izinkanAnggotaBuatPengumuman;
    }

    const { error } = await adminSupabase
      .from("pengaturan_sistem")
      .upsert(dbPayload, { onConflict: "id" });

    if (error) {
      if (error.message?.includes("does not exist") || error.code === "42P01") {
        return {
          success: false,
          error: "Tabel 'pengaturan_sistem' belum dibuat. Silakan jalankan file migrasi '010_phase11_pengaturan_sistem.sql' di Supabase SQL Editor.",
        };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/pengaturan");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan server saat menyimpan keamanan." };
  }
}

/**
 * Mengambil statistik real-time database dan storage
 */
export async function getDatabaseStats(): Promise<{
  isConnected: boolean;
  latencyMs: number;
  totalAnggota: number;
  totalKeuangan: number;
  totalInventaris: number;
  totalArsip: number;
}> {
  const start = Date.now();
  try {
    const supabase = await createClient();

    const [anggotaRes, keuanganRes, inventarisRes, arsipRes] = await Promise.all([
      supabase.from("anggota").select("id", { count: "exact", head: true }),
      supabase.from("catatan_keuangan").select("id", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("inventaris").select("id", { count: "exact", head: true }),
      supabase.from("arsip_dokumen").select("id", { count: "exact", head: true }),
    ]);

    const latencyMs = Date.now() - start;

    return {
      isConnected: true,
      latencyMs: Math.max(latencyMs, 15),
      totalAnggota: anggotaRes.count || 0,
      totalKeuangan: keuanganRes.count || 0,
      totalInventaris: inventarisRes.count || 0,
      totalArsip: arsipRes.count || 0,
    };
  } catch (err) {
    console.error("Database status check error:", err);
    return {
      isConnected: false,
      latencyMs: 0,
      totalAnggota: 0,
      totalKeuangan: 0,
      totalInventaris: 0,
      totalArsip: 0,
    };
  }
}

/**
 * Mengambil log aktivitas sistem terbaru dari berbagai modul database
 */
export async function getRecentAuditLogs(): Promise<
  Array<{
    id: string;
    action: string;
    actor: string;
    timeAgo: string;
    color: string;
  }>
> {
  try {
    const supabase = await createClient();

    const [keuanganLatest, inventarisLatest, pengumumanLatest, arsipLatest] = await Promise.all([
      supabase
        .from("catatan_keuangan")
        .select("id, judul, jenis, created_at, dibuat_oleh, profiles(nama)")
        .order("created_at", { ascending: false })
        .limit(2),
      supabase
        .from("inventaris")
        .select("id, nama_barang, created_at")
        .order("created_at", { ascending: false })
        .limit(2),
      supabase
        .from("pengumuman")
        .select("id, judul, created_at, dibuat_oleh, profiles(nama)")
        .order("created_at", { ascending: false })
        .limit(2),
      supabase
        .from("arsip_dokumen")
        .select("id, judul, created_at")
        .order("created_at", { ascending: false })
        .limit(2),
    ]);

    const logs: Array<{ id: string; action: string; actor: string; date: Date; color: string }> = [];

    (keuanganLatest.data || []).forEach((k: any) => {
      const actorName = k.profiles?.nama || "Pengurus";
      const jenisStr = k.jenis === "masuk" ? "Kas Masuk" : "Kas Keluar";
      logs.push({
        id: `keu-${k.id}`,
        action: `Pencatatan ${jenisStr}: "${k.judul}"`,
        actor: `oleh ${actorName}`,
        date: new Date(k.created_at),
        color: "bg-emerald-400",
      });
    });

    (inventarisLatest.data || []).forEach((inv: any) => {
      logs.push({
        id: `inv-${inv.id}`,
        action: `Inventaris Barang: "${inv.nama_barang}"`,
        actor: `oleh Pengurus Logistik`,
        date: new Date(inv.created_at),
        color: "bg-primary",
      });
    });

    (pengumumanLatest.data || []).forEach((p: any) => {
      const actorName = p.profiles?.nama || "Admin";
      logs.push({
        id: `peng-${p.id}`,
        action: `Rilis Pengumuman: "${p.judul}"`,
        actor: `oleh ${actorName}`,
        date: new Date(p.created_at),
        color: "bg-amber-400",
      });
    });

    (arsipLatest.data || []).forEach((a: any) => {
      logs.push({
        id: `arsip-${a.id}`,
        action: `Upload Dokumen Arsip: "${a.judul}"`,
        actor: `oleh Sekretariat`,
        date: new Date(a.created_at),
        color: "bg-sky-400",
      });
    });

    // Urutkan dari yang paling baru
    logs.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Format waktu cantik
    return logs.slice(0, 5).map((log) => {
      const diffMinutes = Math.floor((Date.now() - log.date.getTime()) / (1000 * 60));
      let timeAgo = "Baru saja";
      if (diffMinutes >= 1440) {
        timeAgo = `${Math.floor(diffMinutes / 1440)} hari lalu`;
      } else if (diffMinutes >= 60) {
        timeAgo = `${Math.floor(diffMinutes / 60)} jam lalu`;
      } else if (diffMinutes > 1) {
        timeAgo = `${diffMinutes} menit lalu`;
      }

      return {
        id: log.id,
        action: log.action,
        actor: log.actor,
        timeAgo,
        color: log.color,
      };
    });
  } catch (err) {
    console.error("Error getting audit logs:", err);
    return [];
  }
}

/**
 * Ekspor data riil modul dari database ke format CSV
 */
export async function exportModuleData(moduleName: "anggota" | "keuangan" | "inventaris"): Promise<{
  success: boolean;
  csv?: string;
  filename?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const todayStr = new Date().toISOString().split("T")[0];

    if (moduleName === "anggota") {
      const { data, error } = await supabase
        .from("anggota")
        .select("id, nama, kontak, rt_rw, jabatan, created_at")
        .order("nama", { ascending: true });

      if (error) throw error;

      const header = ["ID", "Nama Anggota", "Kontak / WhatsApp", "RT/RW", "Jabatan", "Tanggal Terdaftar"];
      const rows = (data || []).map((a) => [
        a.id,
        `"${(a.nama || "").replace(/"/g, '""')}"`,
        `"${(a.kontak || "").replace(/"/g, '""')}"`,
        `"${(a.rt_rw || "").replace(/"/g, '""')}"`,
        `"${(a.jabatan || "").replace(/"/g, '""')}"`,
        a.created_at ? new Date(a.created_at).toLocaleDateString("id-ID") : "-",
      ]);

      const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
      return {
        success: true,
        csv: csvContent,
        filename: `data-anggota-${todayStr}.csv`,
      };
    }

    if (moduleName === "keuangan") {
      const { data, error } = await supabase
        .from("catatan_keuangan")
        .select("id, tanggal, jenis, judul, keterangan, jumlah, created_at")
        .is("deleted_at", null)
        .order("tanggal", { ascending: false });

      if (error) throw error;

      const header = ["ID", "Tanggal Transaksi", "Jenis", "Judul", "Jumlah (Rp)", "Keterangan"];
      const rows = (data || []).map((k) => [
        k.id,
        k.tanggal || "-",
        k.jenis === "masuk" ? "Kas Masuk" : "Kas Keluar",
        `"${(k.judul || "").replace(/"/g, '""')}"`,
        Number(k.jumlah || 0).toString(),
        `"${(k.keterangan || "").replace(/"/g, '""')}"`,
      ]);

      const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
      return {
        success: true,
        csv: csvContent,
        filename: `buku-kas-keuangan-${todayStr}.csv`,
      };
    }

    if (moduleName === "inventaris") {
      const { data, error } = await supabase
        .from("inventaris")
        .select("id, nama_barang, kode_barang, kategori, jumlah, kondisi, lokasi")
        .order("nama_barang", { ascending: true });

      if (error) throw error;

      const header = ["ID", "Nama Barang", "Kode Barang", "Kategori", "Jumlah Unit", "Kondisi", "Lokasi Penyimpanan"];
      const rows = (data || []).map((inv) => [
        inv.id,
        `"${(inv.nama_barang || "").replace(/"/g, '""')}"`,
        `"${(inv.kode_barang || "").replace(/"/g, '""')}"`,
        `"${(inv.kategori || "").replace(/"/g, '""')}"`,
        Number(inv.jumlah || 0).toString(),
        `"${(inv.kondisi || "").replace(/"/g, '""')}"`,
        `"${(inv.lokasi || "").replace(/"/g, '""')}"`,
      ]);

      const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
      return {
        success: true,
        csv: csvContent,
        filename: `data-inventaris-${todayStr}.csv`,
      };
    }

    return { success: false, error: "Modul ekspor tidak dikenali." };
  } catch (err: any) {
    console.error("Export error:", err);
    return { success: false, error: err.message || "Gagal mengekspor data." };
  }
}

/**
 * Membersihkan cache sistem & layout aplikasi
 */
export async function clearSystemCache(): Promise<{ success: boolean; message: string }> {
  try {
    const profile = await getProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "ketua")) {
      return { success: false, message: "Akses ditolak: Hanya Admin/Ketua yang berwenang." };
    }

    revalidatePath("/", "layout");
    return {
      success: true,
      message: "Cache server dan layout aplikasi berhasil dibersihkan dan disegarkan.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal membersihkan cache sistem.",
    };
  }
}
