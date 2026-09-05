"use server";

import { createClient, createAdminClient, getProfile } from "@/lib/supabase/server";
import { uploadLampiran } from "./storage";
import { revalidatePath } from "next/cache";

export async function getKeuanganList(bagianSlug: string = "bendahara") {
  const supabase = await createClient();

  // Get bagian ID
  const { data: bagian } = await supabase
    .from("bagian")
    .select("id")
    .eq("slug", bagianSlug)
    .single();

  if (!bagian) {
    return { list: [], saldo: { masuk: 0, keluar: 0, sisa: 0 } };
  }

  const { data: list, error } = await supabase
    .from("catatan_keuangan")
    .select(`
      *,
      author:profiles!catatan_keuangan_dibuat_oleh_fkey (
        nama,
        role
      )
    `)
    .eq("bagian_id", bagian.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching keuangan:", error);
    return { list: [], saldo: { masuk: 0, keluar: 0, sisa: 0 } };
  }

  // Calculate aggregations
  let totalMasuk = 0;
  let totalKeluar = 0;

  list?.forEach((trx) => {
    if (trx.jenis === "masuk") {
      totalMasuk += Number(trx.jumlah);
    } else if (trx.jenis === "keluar") {
      totalKeluar += Number(trx.jumlah);
    }
  });

  return {
    list: list || [],
    saldo: {
      masuk: totalMasuk,
      keluar: totalKeluar,
      sisa: totalMasuk - totalKeluar,
    },
  };
}

export async function createTransaksi(formData: FormData, bagianSlug: string = "bendahara") {
  try {
    const profile = await getProfile();
    if (!profile) {
      return { error: "Anda harus login terlebih dahulu." };
    }

    const jenis = formData.get("jenis") as "masuk" | "keluar";
    const judul = formData.get("judul") as string;
    const keterangan = formData.get("keterangan") as string;
    const jumlahStr = (formData.get("jumlah") as string) || "";
    // Hilangkan titik pemisah ribuan locale ID dan normalisasi
    const cleanedJumlah = jumlahStr
      .replace(/\./g, "")
      .replace(/,/g, ".")
      .replace(/[^0-9.]/g, "");
    const jumlah = parseFloat(cleanedJumlah || "0");
    const file = formData.get("lampiran") as File | null;

    if (!jenis || !judul?.trim() || isNaN(jumlah) || jumlah <= 0) {
      return { error: "Jenis, judul, dan nominal transaksi yang valid wajib diisi." };
    }

    if (jenis === "keluar" && (!file || file.size === 0)) {
      return { error: "Nota/bukti lampiran WAJIB disertakan untuk transaksi pengeluaran (kas keluar)." };
    }

    const adminSupabase = await createAdminClient();

    // Dapatkan bagian ID
    const { data: bagian, error: bagianErr } = await adminSupabase
      .from("bagian")
      .select("id, slug")
      .eq("slug", bagianSlug)
      .single();

    if (bagianErr || !bagian) {
      return { error: "Bagian/divisi tidak ditemukan." };
    }

    // Role check: admin, ketua, atau anggota bagian yang bersangkutan
    const isAuthorized =
      profile.role === "admin" ||
      profile.role === "ketua" ||
      profile.bagian_id === bagian.id;

    if (!isAuthorized) {
      return {
        error: "Hanya pengurus bendahara, ketua, atau admin yang berhak mencatat transaksi kas.",
      };
    }

    let lampiran_url: string | null = null;
    if (file && file.size > 0) {
      const uploadRes = await uploadLampiran(file, `keuangan/${bagianSlug}`);
      if (uploadRes.error) {
        return { error: uploadRes.error };
      }
      lampiran_url = uploadRes.url || null;
    }

    // Insert menggunakan adminSupabase untuk mencegah kegagalan RLS
    const { error: insertError } = await adminSupabase
      .from("catatan_keuangan")
      .insert({
        bagian_id: bagian.id,
        jenis,
        judul: judul.trim(),
        keterangan: keterangan?.trim() || null,
        jumlah,
        lampiran_url,
        dibuat_oleh: profile.id,
      });

    if (insertError) {
      console.error("Error inserting catatan_keuangan:", insertError);
      return { error: insertError.message };
    }

    revalidatePath(`/bagian/${bagianSlug}`);
    revalidatePath("/bagian/bendahara");
    revalidatePath("/dashboard");
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    console.error("createTransaksi exception:", err);
    const message = err instanceof Error ? err.message : "Terjadi kesalahan internal.";
    return { error: message };
  }
}

export async function deleteTransaksi(id: string, bagianSlug: string = "bendahara") {
  try {
    const profile = await getProfile();
    if (!profile) {
      return { error: "Anda harus login terlebih dahulu." };
    }

    const adminSupabase = await createAdminClient();

    // Check existing transaction
    const { data: existing, error: findError } = await adminSupabase
      .from("catatan_keuangan")
      .select("id, dibuat_oleh, bagian_id")
      .eq("id", id)
      .single();

    if (findError || !existing) {
      return { error: "Transaksi tidak ditemukan." };
    }

    // Authorized if admin, ketua, or the creator
    const isAuthorized =
      profile.role === "admin" ||
      profile.role === "ketua" ||
      profile.bagian_id === existing.bagian_id ||
      existing.dibuat_oleh === profile.id;

    if (!isAuthorized) {
      return { error: "Anda tidak memiliki izin untuk menghapus transaksi ini." };
    }

    // Soft delete
    const { error } = await adminSupabase
      .from("catatan_keuangan")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/bagian/${bagianSlug}`);
    revalidatePath("/bagian/bendahara");
    revalidatePath("/dashboard");
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan internal.";
    return { error: message };
  }
}
