"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

export function ThemeToggle({ showLabel = false, className }: { showLabel?: boolean; className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant={showLabel ? 'outline' : 'ghost'} size={showLabel ? 'default' : 'icon'} className={cn(showLabel ? 'h-auto min-h-16 justify-start gap-3 whitespace-normal px-3 py-2.5 text-left sm:min-h-20 sm:px-4 sm:py-3' : 'h-9 w-9', className)} aria-label="Ganti tema terang atau gelap">
        <Sun className="h-4 w-4" />
        {showLabel && <span><span className="block text-sm">Tema tampilan</span><span className="mt-0.5 block text-[11px] font-normal text-muted-foreground sm:text-xs">Terang atau gelap</span></span>}
      </Button>
    );
  }

  return (
    <Button
      variant={showLabel ? 'outline' : 'ghost'}
      size={showLabel ? 'default' : 'icon'}
      className={cn(showLabel ? 'h-auto min-h-16 justify-start gap-3 whitespace-normal px-3 py-2.5 text-left sm:min-h-20 sm:px-4 sm:py-3' : 'h-9 w-9', className)}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 transition-all" />
      ) : (
        <Moon className="h-4 w-4 transition-all" />
      )}
      {showLabel && <span><span className="block text-sm">{theme === 'dark' ? 'Gunakan Tema Terang' : 'Gunakan Tema Gelap'}</span><span className="mt-0.5 block text-[11px] font-normal text-muted-foreground sm:text-xs">Sesuaikan tampilan aplikasi</span></span>}
    </Button>
  );
}
