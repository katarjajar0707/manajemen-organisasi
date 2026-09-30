import { toast } from 'sonner';
import { type Transaksi, formatTanggalLaporan } from '@/constants/keuangan';

interface ExportPdfOptions {
  filteredList: Transaksi[];
  filterJenis: 'semua' | 'masuk' | 'keluar';
  totalMasukFiltered: number;
  totalKeluarFiltered: number;
  saldoSisa: number;
  orgName: string;
  formatRupiah: (angka: number | string) => string;
}

export function exportKeuanganToPdf({
  filteredList,
  filterJenis,
  totalMasukFiltered,
  totalKeluarFiltered,
  saldoSisa,
  orgName,
  formatRupiah,
}: ExportPdfOptions) {
  if (filteredList.length === 0) {
    toast.error('Tidak ada data transaksi untuk diekspor.');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    toast.error('Gagal membuka jendela cetak. Pastikan pop-up diizinkan pada browser.');
    return;
  }

  const filterText = [
    filterJenis === 'masuk' ? 'Kas Masuk (Pemasukan)' : filterJenis === 'keluar' ? 'Kas Keluar (Pengeluaran)' : 'Semua Mutasi',
  ].join(' | ');

  const saldoFiltered = totalMasukFiltered - totalKeluarFiltered;

  const escapeHtml = (value: unknown) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const rowsHtml = filteredList
    .map((trx, idx) => {
      const tgl = formatTanggalLaporan(trx.tanggal || trx.created_at);
      const jenisLabel = trx.jenis === 'masuk' ? 'Masuk' : 'Keluar';
      const nominalColor = trx.jenis === 'masuk' ? '#047857' : '#b91c1c';
      const cleanDesc = trx.displayKeterangan || trx.keterangan || '';
      const title = escapeHtml(trx.judul || 'Transaksi');
      const description = escapeHtml(cleanDesc);
      const kategori = escapeHtml(trx.kategori || 'Kas General');
      const author = escapeHtml(trx.author?.nama || 'Admin');

      const rowBg = idx % 2 === 1 ? 'background-color: #f8fafc;' : '';

      return `
        <tr style="${rowBg}">
          <td style="text-align: center; font-size: 8.5px; color: #64748b;">${idx + 1}</td>
          <td style="text-align: center; white-space: nowrap; font-family: monospace; font-size: 9px; font-weight: 500;">${tgl}</td>
          <td style="vertical-align: top;">
            <div style="font-weight: 600; color: #0f172a; line-height: 1.25;">${title}</div>
            ${description ? `<div class="description">${description}</div>` : ''}
          </td>
          <td style="font-size: 8.5px; color: #475569;">${kategori}</td>
          <td style="text-align: center;">
            <span style="display: inline-block; padding: 1.5px 6px; border-radius: 4px; font-size: 8.5px; font-weight: 600; background-color: ${trx.jenis === 'masuk' ? '#d1fae5' : '#fee2e2'}; color: ${trx.jenis === 'masuk' ? '#065f46' : '#991b1b'};">
              ${jenisLabel}
            </span>
          </td>
          <td style="text-align: right; font-family: monospace; font-weight: 700; font-size: 9px; color: ${nominalColor};">
            ${formatRupiah(trx.jumlah)}
          </td>
          <td style="font-size: 8.5px; color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${author}</td>
        </tr>
      `;
    })
    .join('');

  const printDate = formatTanggalLaporan(new Date());

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>Laporan Keuangan ${orgName} - ${printDate}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 12mm 12mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 0;
            font-size: 10px;
            line-height: 1.35;
            background-color: #ffffff;
          }
          .kop {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 10px;
            margin-bottom: 14px;
          }
          .kop h2 {
            margin: 0;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #475569;
            font-weight: 600;
          }
          .kop h1 {
            margin: 3px 0;
            font-size: 17px;
            color: #0f172a;
            letter-spacing: 0.5px;
            font-weight: 800;
          }
          .kop p {
            margin: 0;
            font-size: 9.5px;
            color: #64748b;
          }
          .meta-box {
            display: flex;
            justify-content: space-between;
            margin-bottom: 14px;
            padding: 8px 12px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-size: 9.5px;
          }
          .summary-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 14px;
          }
          .card {
            padding: 8px 12px;
            border-radius: 6px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
          }
          .card-title {
            font-size: 8.5px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            margin-bottom: 3px;
          }
          .card-value {
            font-size: 13px;
            font-weight: 800;
            font-family: monospace;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
            font-size: 9px;
          }
          col.no { width: 4%; }
          col.tanggal { width: 11%; }
          col.uraian { width: 35%; }
          col.kategori { width: 14%; }
          col.jenis { width: 9%; }
          col.nominal { width: 15%; }
          col.pencatat { width: 12%; }
          th {
            background-color: #0f172a;
            color: #ffffff;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 8px;
            letter-spacing: 0.5px;
            padding: 6px 8px;
            border: 1px solid #0f172a;
          }
          td {
            padding: 5px 8px;
            border: 1px solid #cbd5e1;
            vertical-align: middle;
          }
          .description {
            font-size: 8px;
            color: #64748b;
            margin-top: 1px;
            font-style: italic;
          }
          .tanda-tangan {
            display: flex;
            justify-content: space-between;
            margin-top: 24px;
            page-break-inside: avoid;
          }
          .ttd-box {
            text-align: center;
            width: 180px;
            font-size: 9.5px;
          }
          .ttd-space {
            height: 48px;
          }
          @media print {
            body {
              padding: 0;
              background-color: transparent;
            }
            .no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 12px; display: flex; justify-content: flex-end; gap: 8px;">
          <button onclick="window.close()" style="padding: 6px 14px; background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600;">
            ✕ Tutup
          </button>
          <button onclick="window.print()" style="padding: 6px 16px; background-color: #0284c7; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 11px; display: inline-flex; align-items: center; gap: 6px;">
            <span>🖨️</span> Cetak / Simpan PDF
          </button>
        </div>

        <div class="kop">
          <h2>PENGURUS ${orgName.toUpperCase()}</h2>
          <h1>LAPORAN REKAPITULASI ARUS KAS KEUANGAN</h1>
          <p>Sistem Informasi Manajemen Organisasi & Transparansi Keuangan</p>
        </div>

        <div class="meta-box">
          <div>
            <div><strong>Kategori Filter:</strong> ${filterText}</div>
            <div><strong>Total Transaksi:</strong> ${filteredList.length} catatan</div>
          </div>
          <div style="text-align: right;">
            <div><strong>Tanggal Cetak:</strong> ${printDate}</div>
            <div><strong>Status:</strong> Sah / Terverifikasi Sistem</div>
          </div>
        </div>

        <div class="summary-cards">
          <div class="card" style="border-left: 3.5px solid #059669;">
            <div class="card-title">Total Pemasukan</div>
            <div class="card-value" style="color: #059669;">${formatRupiah(totalMasukFiltered)}</div>
          </div>
          <div class="card" style="border-left: 3.5px solid #dc2626;">
            <div class="card-title">Total Pengeluaran</div>
            <div class="card-value" style="color: #dc2626;">${formatRupiah(totalKeluarFiltered)}</div>
          </div>
          <div class="card" style="border-left: 3.5px solid #0284c7;">
            <div class="card-title">Sisa Saldo Kas</div>
            <div class="card-value" style="color: #0284c7;">${formatRupiah(saldoSisa)}</div>
          </div>
        </div>

        <table>
          <colgroup>
            <col class="no">
            <col class="tanggal">
            <col class="uraian">
            <col class="kategori">
            <col class="jenis">
            <col class="nominal">
            <col class="pencatat">
          </colgroup>
          <thead>
            <tr>
              <th style="text-align: center;">No</th>
              <th style="text-align: center;">Tanggal</th>
              <th>Uraian / Judul Transaksi</th>
              <th>Kategori</th>
              <th style="text-align: center;">Jenis</th>
              <th style="text-align: right;">Nominal</th>
              <th>Pencatat</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr style="background-color: #f8fafc; font-weight: bold;">
              <td colspan="5" style="text-align: right; padding: 8px; font-size: 9px;">Total Mutasi (Data Sesuai Filter):</td>
              <td style="text-align: right; font-family: monospace; font-weight: 700; font-size: 9.5px; color: ${saldoFiltered >= 0 ? '#047857' : '#b91c1c'};">
                ${formatRupiah(saldoFiltered)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <div class="tanda-tangan">
          <div class="ttd-box">
            <p>Mengetahui,<br><strong>Ketua Karang Taruna</strong></p>
            <div class="ttd-space"></div>
            <p><strong>( ........................................ )</strong></p>
          </div>
          <div class="ttd-box">
            <p>Tertanda,<br><strong>Bendahara Umum</strong></p>
            <div class="ttd-space"></div>
            <p><strong>( ........................................ )</strong></p>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
