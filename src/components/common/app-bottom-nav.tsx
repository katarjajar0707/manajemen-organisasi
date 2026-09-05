"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BOTTOM_NAV_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

import { LayoutGrid, Menu } from "lucide-react";
import { useSidebarStore } from "@/store/sidebar-store";

export function AppBottomNav() {
  const pathname = usePathname();
  const toggleMobile = useSidebarStore((s) => s.toggleMobile);
  const isMobileOpen = useSidebarStore((s) => s.isMobileOpen);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 w-full items-center justify-around border-t border-border/60 bg-background/95 backdrop-blur-md lg:hidden px-1">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all duration-150",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                isActive
                  ? "bg-primary/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                  : ""
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  isActive ? "stroke-[2.5] text-primary" : "stroke-2"
                )}
              />
            </div>
            <span
              className={cn(
                "text-[10px] font-bold truncate max-w-[60px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.title}
            </span>
          </Link>
        );
      })}

      {/* Button Menu Lengkap (Drawer) */}
      <button
        type="button"
        onClick={toggleMobile}
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all duration-150",
          isMobileOpen
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
            isMobileOpen
              ? "bg-primary/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
              : ""
          )}
        >
          <LayoutGrid
            className={cn(
              "h-4 w-4",
              isMobileOpen ? "stroke-[2.5] text-primary" : "stroke-2"
            )}
          />
        </div>
        <span
          className={cn(
            "text-[10px] font-bold truncate max-w-[60px]",
            isMobileOpen ? "text-primary" : "text-muted-foreground"
          )}
        >
          Menu
        </span>
      </button>
    </nav>
  );
}
