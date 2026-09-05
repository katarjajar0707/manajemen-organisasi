export const USER_ROLES = {
  ADMIN: "admin",
  KETUA: "ketua",
  ANGGOTA: "anggota",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  ketua: "Ketua",
  anggota: "Anggota",
};
