"use server";

import { createClient } from "@/lib/supabase/server";
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
    const jenis = formData.get("jenis") as "masuk" | "keluar";
    const judul = formData.get("judul") as string;
    const keterangan = formData.get("keterangan") as string;
    const jumlahStr = formData.get("jumlah") as string;
    const jumlah = parseFloat(jumlahStr.replace(/[^0-9.-]+/g, ""));
    const file = formData.get("lampiran") as File | null;

    if (!jenis || !judul || isNaN(jumlah) || jumlah <= 0) {
      return { error: "Jenis, judul, dan jumlah nominal valid wajib diisi." };
    }

    if (jenis === "keluar" && (!file || file.size === 0)) {
      return { error: "Nota/bukti lampiran WAJIB disertakan untuk transaksi pengeluaran." };
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthenticated" };

    const { data: bagian } = await supabase
      .from("bagian")
      .select("id")
      .eq("slug", bagianSlug)
      .single();

    if (!bagian) return { error: "Bagian tidak ditemukan." };

    let lampiran_url = null;
    if (file && file.size > 0) {
      const uploadRes = await uploadLampiran(file, `keuangan/${bagianSlug}`);
      if (uploadRes.error) {
        return { error: uploadRes.error };
      }
      lampiran_url = uploadRes.url;
    }

    const { error } = await supabase.from("catatan_keuangan").insert({
      bagian_id: bagian.id,
      jenis,
      judul,
      keterangan,
      jumlah,
      lampiran_url,
      dibuat_oleh: user.id,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/bagian/${bagianSlug}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan internal." };
  }
}

export async function deleteTransaksi(id: string, bagianSlug: string = "bendahara") {
  try {
    const supabase = await createClient();
    
    // Soft delete
    const { error } = await supabase
      .from("catatan_keuangan")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/bagian/${bagianSlug}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Terjadi kesalahan internal." };
  }
}
