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
      <Button
        variant={showLabel ? 'outline' : 'ghost'}
        size={showLabel ? 'default' : 'icon'}
        className={cn(
          showLabel
            ? 'h-auto min-h-16 justify-start gap-3 whitespace-normal px-3 py-2.5 text-left sm:min-h-20 sm:px-4 sm:py-3'
            : 'h-9 w-9',
          className
        )}
        aria-label="Ganti tema terang atau gelap"
      >
        {showLabel ? (
          <>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400 sm:h-9 sm:w-9">
              <Sun className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">Tema Tampilan</span>
              <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground sm:text-xs">
                Sesuaikan tampilan aplikasi
              </span>
            </span>
          </>
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={showLabel ? 'outline' : 'ghost'}
      size={showLabel ? 'default' : 'icon'}
      className={cn(
        showLabel
          ? 'h-auto min-h-16 justify-start gap-3 whitespace-normal px-3 py-2.5 text-left sm:min-h-20 sm:px-4 sm:py-3'
          : 'h-9 w-9',
        className
      )}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {showLabel ? (
        <>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400 sm:h-9 sm:w-9">
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 transition-all" />
            ) : (
              <Moon className="h-4 w-4 transition-all" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">
              {theme === 'dark' ? 'Gunakan Tema Terang' : 'Gunakan Tema Gelap'}
            </span>
            <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground sm:text-xs">
              Sesuaikan tampilan aplikasi
            </span>
          </span>
        </>
      ) : (
        <>
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 transition-all" />
          ) : (
            <Moon className="h-4 w-4 transition-all" />
          )}
        </>
      )}
    </Button>
  );
}
