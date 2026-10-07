import { toast } from 'sonner';
import { type Transaksi, type ClosingKeuangan, formatTanggalLaporan } from '@/constants/keuangan';

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

export interface ExportClosingPdfOptions {
  closing: ClosingKeuangan;
  transaksiList: Transaksi[];
  orgName: string;
  formatRupiah: (angka: number | string) => string;
}

export function exportClosingBeritaAcaraPdf({
  closing,
  transaksiList,
  orgName,
  formatRupiah,
}: ExportClosingPdfOptions) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    toast.error('Gagal membuka jendela cetak. Pastikan pop-up diizinkan pada browser.');
    return;
  }

  const escapeHtml = (value: unknown) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const tglClosing = formatTanggalLaporan(closing.tanggal_closing || closing.created_at);
  const tglMulai = closing.tanggal_mulai ? formatTanggalLaporan(closing.tanggal_mulai) : '-';
  const tglSelesai = closing.tanggal_selesai ? formatTanggalLaporan(closing.tanggal_selesai) : tglClosing;
  const authorName = escapeHtml(closing.author?.nama || 'Bendahara');

  const rowsHtml = transaksiList.length === 0
    ? `<tr><td colspan="6" style="text-align: center; padding: 12px; color: #64748b;">Tidak ada rincian transaksi dalam closing ini.</td></tr>`
    : transaksiList
        .map((trx, idx) => {
          const tgl = formatTanggalLaporan(trx.tanggal || trx.created_at);
          const isMasuk = trx.jenis === 'masuk';
          const nominalColor = isMasuk ? '#047857' : '#b91c1c';
          const title = escapeHtml(trx.judul || 'Transaksi');
          const kategori = escapeHtml(trx.kategori || 'Kas General');
          const cleanDesc = trx.displayKeterangan || trx.keterangan || '';
          const author = escapeHtml(trx.author?.nama || '-');
          const rowBg = idx % 2 === 1 ? 'background-color: #f8fafc;' : '';

          return `
            <tr style="${rowBg}">
              <td style="text-align: center; color: #64748b;">${idx + 1}</td>
              <td style="text-align: center; white-space: nowrap; color: #334155;">${tgl}</td>
              <td>
                <div style="font-weight: 600; color: #0f172a;">${title}</div>
                ${cleanDesc ? `<div style="font-size: 8px; color: #64748b; margin-top: 1px;">${escapeHtml(cleanDesc)}</div>` : ''}
              </td>
              <td><span style="display: inline-block; font-size: 8px; font-weight: 500; background: #f1f5f9; padding: 1px 4px; border-radius: 3px; color: #334155;">${kategori}</span></td>
              <td style="text-align: center;">
                <span style="display: inline-block; font-size: 8px; font-weight: 700; padding: 1px 4px; border-radius: 3px; ${isMasuk ? 'background: #d1fae5; color: #065f46;' : 'background: #fee2e2; color: #991b1b;'}">
                  ${isMasuk ? 'Masuk' : 'Keluar'}
                </span>
              </td>
              <td style="text-align: right; font-family: monospace; font-weight: 600; color: ${nominalColor};">
                ${isMasuk ? '+' : '-'}${formatRupiah(trx.jumlah)}
              </td>
            </tr>
          `;
        })
        .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>Berita Acara Closing - ${escapeHtml(closing.nomor_closing)}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm 15mm 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 0;
            font-size: 9.5px;
            line-height: 1.35;
          }
          .header-kop {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .header-kop h1 {
            font-size: 15px;
            margin: 0 0 2px 0;
            text-transform: uppercase;
            font-weight: 800;
            letter-spacing: 0.5px;
            color: #0f172a;
          }
          .header-kop h2 {
            font-size: 12px;
            margin: 0 0 4px 0;
            font-weight: 700;
            color: #1e3a8a;
            letter-spacing: 0.3px;
          }
          .header-kop p {
            font-size: 8.5px;
            margin: 0;
            color: #475569;
          }
          .doc-badge {
            display: inline-block;
            background: #0f172a;
            color: #ffffff;
            font-size: 8.5px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 4px;
            letter-spacing: 0.5px;
            margin-top: 4px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 12px;
            background-color: #f8fafc;
            border: 1px solid #e2e88f;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px 12px;
          }
          .info-row {
            display: flex;
            margin-bottom: 3px;
          }
          .info-label {
            width: 110px;
            color: #64748b;
            font-weight: 500;
          }
          .info-val {
            font-weight: 600;
            color: #0f172a;
            flex: 1;
          }
          .summary-cards {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-bottom: 14px;
          }
          .summary-card {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 8px;
            text-align: center;
            background: #ffffff;
          }
          .summary-title {
            font-size: 8px;
            font-weight: 600;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 2px;
          }
          .summary-val {
            font-size: 11px;
            font-weight: 800;
            font-family: monospace;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5px;
            margin-bottom: 16px;
          }
          th {
            background-color: #f1f5f9;
            color: #334155;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 8px;
            border: 1px solid #cbd5e1;
            padding: 5px 6px;
          }
          td {
            border: 1px solid #e2e8f0;
            padding: 4px 6px;
            vertical-align: middle;
          }
          .tanda-tangan {
            display: flex;
            justify-content: space-between;
            margin-top: 18px;
            page-break-inside: avoid;
          }
          .ttd-box {
            text-align: center;
            width: 200px;
          }
          .ttd-space {
            height: 48px;
          }
        </style>
      </head>
      <body>
        <div class="header-kop">
          <h1>${escapeHtml(orgName)}</h1>
          <h2>BERITA ACARA PENUTUPAN BUKU KAS (CLOSING)</h2>
          <p>Dokumen Resmi Arsip Keuangan & Rekonsiliasi Kas Organisasi</p>
          <div class="doc-badge">${escapeHtml(closing.nomor_closing)}</div>
        </div>

        <div class="info-grid">
          <div>
            <div class="info-row"><span class="info-label">Judul Closing:</span><span class="info-val">${escapeHtml(closing.judul)}</span></div>
            <div class="info-row"><span class="info-label">Tanggal Closing:</span><span class="info-val">${tglClosing}</span></div>
            <div class="info-row"><span class="info-label">Periode Transaksi:</span><span class="info-val">${tglMulai} s.d. ${tglSelesai}</span></div>
          </div>
          <div>
            <div class="info-row"><span class="info-label">Penanggung Jawab:</span><span class="info-val">${authorName}</span></div>
            <div class="info-row"><span class="info-label">Total Transaksi:</span><span class="info-val">${closing.total_transaksi} Transaksi</span></div>
            <div class="info-row"><span class="info-label">Status Audit:</span><span class="info-val" style="color: ${closing.status === 'closed' ? '#047857' : '#b45309'};">${closing.status === 'closed' ? 'Tutup Buku Sah (Final)' : 'Dibuka Kembali (Reopened)'}</span></div>
          </div>
        </div>

        <div class="summary-cards">
          <div class="summary-card" style="border-left: 3px solid #64748b;">
            <div class="summary-title">Saldo Awal</div>
            <div class="summary-val" style="color: #334155;">${formatRupiah(closing.saldo_awal)}</div>
          </div>
          <div class="summary-card" style="border-left: 3px solid #059669;">
            <div class="summary-title">Pemasukan (+)</div>
            <div class="summary-val" style="color: #047857;">+${formatRupiah(closing.total_masuk)}</div>
          </div>
          <div class="summary-card" style="border-left: 3px solid #dc2626;">
            <div class="summary-title">Pengeluaran (-)</div>
            <div class="summary-val" style="color: #b91c1c;">-${formatRupiah(closing.total_keluar)}</div>
          </div>
          <div class="summary-card" style="border-left: 3px solid #2563eb; background: #eff6ff;">
            <div class="summary-title" style="color: #1d4ed8;">Saldo Akhir Sisa</div>
            <div class="summary-val" style="color: #1e40af;">${formatRupiah(closing.saldo_akhir)}</div>
          </div>
        </div>

        ${closing.catatan ? `
          <div style="margin-bottom: 12px; padding: 6px 10px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 4px; font-size: 8.5px; color: #92400e;">
            <strong>Catatan Berita Acara:</strong> ${escapeHtml(closing.catatan)}
          </div>
        ` : ''}

        <div style="font-weight: 700; font-size: 9px; margin-bottom: 4px; text-transform: uppercase; color: #334155;">
          Rincian Transaksi Yang Ditutup (${transaksiList.length} Mutasi)
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 25px; text-align: center;">No</th>
              <th style="width: 70px; text-align: center;">Tanggal</th>
              <th>Judul & Keterangan Transaksi</th>
              <th style="width: 90px;">Kategori</th>
              <th style="width: 55px; text-align: center;">Jenis</th>
              <th style="width: 90px; text-align: right;">Nominal</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="tanda-tangan">
          <div class="ttd-box">
            <p>Mengetahui,<br><strong>Ketua Karang Taruna</strong></p>
            <div class="ttd-space"></div>
            <p><strong>( ........................................ )</strong></p>
          </div>
          <div class="ttd-box">
            <p>Dibuat & Ditutup Oleh,<br><strong>Bendahara Umum</strong></p>
            <div class="ttd-space"></div>
            <p><strong>${authorName}</strong></p>
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

