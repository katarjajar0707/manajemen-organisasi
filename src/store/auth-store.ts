import { create } from "zustand";

export type UserRole = "admin" | "ketua" | "sekretaris" | "bendahara" | "koordinator" | "anggota";

interface AuthStore {
  userRole: UserRole;
  userName: string;
  avatarUrl: string | null;
  setUserRole: (role: UserRole) => void;
  setUserName: (name: string) => void;
  setAvatarUrl: (url: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  userRole: "admin",
  userName: "Azzam Azhari",
  avatarUrl: null,
  setUserRole: (role) => set({ userRole: role }),
  setUserName: (name) => set({ userName: name }),
  setAvatarUrl: (url) => set({ avatarUrl: url }),
}));
