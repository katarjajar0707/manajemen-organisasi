"use client";

import { useAuthStore } from "@/stores/auth-store";

export function useAuth() {
  const { profile, isLoading, setProfile, reset } = useAuthStore();

  return {
    profile,
    isLoading,
    isAuthenticated: !!profile,
    isAdmin: profile?.role === "admin",
    isKetua: profile?.role === "ketua" || profile?.role === "admin",
    setProfile,
    reset,
  };
}
