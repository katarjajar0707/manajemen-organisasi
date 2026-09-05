import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarStore {
  isCollapsed: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
  isMobileOpen: boolean;
  toggleMobile: () => void;
  setMobileOpen: (value: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isCollapsed: false,
      toggle: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
      setCollapsed: (value) => set({ isCollapsed: value }),
      isMobileOpen: false,
      toggleMobile: () => set((s) => ({ isMobileOpen: !s.isMobileOpen })),
      setMobileOpen: (value) => set({ isMobileOpen: value }),
    }),
    {
      name: "sidebar-collapsed",
      partialize: (state) => ({ isCollapsed: state.isCollapsed }), // only persist isCollapsed, not isMobileOpen
    }
  )
);
