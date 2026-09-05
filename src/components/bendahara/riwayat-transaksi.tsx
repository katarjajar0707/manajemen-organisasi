"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowDownLeft, ArrowUpRight, Paperclip } from "lucide-react";

const TRANSAKSI = [
  {
    jenis: "masuk",
    judul: "Iuran Kas Warga RT 02",
    nominal: "Rp 500.000",
    tanggal: "5 Sep 2026",
    bukti: true,
  },
  {
    jenis: "keluar",
    judul: "Beli Perlengkapan Cat Gapura",
    nominal: "Rp 320.000",
    tanggal: "3 Sep 2026",
    bukti: true,
  },
  {
    jenis: "masuk",
    judul: "Donasi Hamba Allah untuk Lomba",
    nominal: "Rp 1.000.000",
    tanggal: "1 Sep 2026",
    bukti: false,
  },
  {
    jenis: "keluar",
    judul: "Print Undangan Rapat Warga",
    nominal: "Rp 45.000",
    tanggal: "29 Agu 2026",
    bukti: false,
  },
  {
    jenis: "masuk",
    judul: "Iuran Kas Warga RT 05",
    nominal: "Rp 750.000",
    tanggal: "27 Agu 2026",
    bukti: true,
  },
];

function TransaksiItem({
  trx,
}: {
  trx: (typeof TRANSAKSI)[number];
}) {
  const isMasuk = trx.jenis === "masuk";
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card/60 hover:border-border/80 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg shrink-0 ${
            isMasuk
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {isMasuk ? (
            <ArrowDownLeft className="h-5 w-5" />
          ) : (
            <ArrowUpRight className="h-5 w-5" />
          )}
        </div>
        <div>
          <h4 className="font-semibold text-sm">{trx.judul}</h4>
          <p className="text-xs text-muted-foreground">{trx.tanggal}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div
          className={`font-bold text-sm sm:text-base ${
            isMasuk ? "text-emerald-500" : "text-destructive"
          }`}
        >
          {isMasuk ? `+${trx.nominal}` : `−${trx.nominal}`}
        </div>
        {trx.bukti && (
          <Badge variant="outline" className="text-[10px] gap-1 mt-0.5">
            <Paperclip className="h-2.5 w-2.5" />
            Nota
          </Badge>
        )}
      </div>
    </div>
  );
}

export function RiwayatTransaksi() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Transaksi Keuangan</CardTitle>
        <CardDescription>
          Daftar mutasi kas masuk dan kas keluar. Gunakan filter untuk menyaring jenis transaksi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="semua">
          {/* Filter Tabs */}
          <TabsList className="mb-4 h-9">
            <TabsTrigger value="semua" className="text-xs px-4">
              Semua
            </TabsTrigger>
            <TabsTrigger value="masuk" className="text-xs px-4">
              <ArrowDownLeft className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
              Uang Masuk
            </TabsTrigger>
            <TabsTrigger value="keluar" className="text-xs px-4">
              <ArrowUpRight className="h-3.5 w-3.5 mr-1.5 text-destructive" />
              Uang Keluar
            </TabsTrigger>
          </TabsList>

          {/* Semua */}
          <TabsContent value="semua" className="space-y-2 mt-0">
            {TRANSAKSI.map((trx, idx) => (
              <TransaksiItem key={idx} trx={trx} />
            ))}
          </TabsContent>

          {/* Uang Masuk */}
          <TabsContent value="masuk" className="space-y-2 mt-0">
            {TRANSAKSI.filter((t) => t.jenis === "masuk").map((trx, idx) => (
              <TransaksiItem key={idx} trx={trx} />
            ))}
          </TabsContent>

          {/* Uang Keluar */}
          <TabsContent value="keluar" className="space-y-2 mt-0">
            {TRANSAKSI.filter((t) => t.jenis === "keluar").map((trx, idx) => (
              <TransaksiItem key={idx} trx={trx} />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
