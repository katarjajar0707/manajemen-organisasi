import { create } from "zustand";

export type UserRole = "admin" | "ketua" | "sekretaris" | "bendahara" | "koordinator" | "anggota";

interface AuthStore {
  userRole: UserRole;
  userName: string;
  setUserRole: (role: UserRole) => void;
  setUserName: (name: string) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  userRole: "admin",
  userName: "Azzam Azhari",
  setUserRole: (role) => set({ userRole: role }),
  setUserName: (name) => set({ userName: name }),
}));
