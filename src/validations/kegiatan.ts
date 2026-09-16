import { z } from 'zod';

export const kegiatanSchema = z.object({
  judul: z.string().min(1, 'Judul kegiatan wajib diisi'),
  deskripsi: z.string().min(1, 'Deskripsi kegiatan wajib diisi'),
  tanggal_mulai: z.string().min(1, 'Tanggal mulai kegiatan wajib diisi'),
  tanggal_selesai: z.string().optional().default(''),
  waktu_mulai: z.string().optional().default('00:00'),
  waktu_selesai: z.string().optional().default('23:59'),
  lokasi: z.string().optional().default(''),
  bagian_id: z.string().nullable().optional(),
  target_rab: z.coerce.number().min(0, 'Target RAB minimal 0').default(0),
});

export type KegiatanSchemaValues = z.infer<typeof kegiatanSchema>;
