import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Hanya huruf, angka, dan garis bawah"),
  bio: z.string().max(200, "Bio maksimal 200 karakter").optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
