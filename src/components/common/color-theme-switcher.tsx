'use client';

import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type ColorTheme = 'green' | 'blue' | 'orange' | 'pink' | 'red';

const COLOR_THEME_STORAGE_KEY = 'karta-theme-color';

export const colorThemeOptions: Array<{ id: ColorTheme; label: string; swatch: string; accent: string }> = [
  { id: 'green', label: 'Nature', swatch: '#10b981', accent: '#34d399' },
  { id: 'blue', label: 'Calm', swatch: '#3b82f6', accent: '#60a5fa' },
  { id: 'orange', label: 'Energy', swatch: '#f59e0b', accent: '#fb923c' },
  { id: 'pink', label: 'Playful', swatch: '#ec4899', accent: '#f472b6' },
  { id: 'red', label: 'Bold', swatch: '#ef4444', accent: '#f87171' },
];

function getStoredColorTheme(): ColorTheme {
  if (typeof window === 'undefined') return 'green';

  const saved = window.localStorage.getItem(COLOR_THEME_STORAGE_KEY);
  if (saved && colorThemeOptions.some((option) => option.id === saved)) {
    return saved as ColorTheme;
  }

  return 'green';
}

export function ColorThemeSwitcher({ isCollapsed = false, showDivider = true }: { isCollapsed?: boolean; showDivider?: boolean }) {
  const [selectedTheme, setSelectedTheme] = React.useState<ColorTheme>('green');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const initialTheme = getStoredColorTheme();
    setSelectedTheme(initialTheme);
    document.documentElement.setAttribute('data-color-theme', initialTheme);
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;

    document.documentElement.setAttribute('data-color-theme', selectedTheme);
    window.localStorage.setItem(COLOR_THEME_STORAGE_KEY, selectedTheme);
  }, [mounted, selectedTheme]);

  const selectedOption = colorThemeOptions.find((option) => option.id === selectedTheme) ?? colorThemeOptions[0];

  return (
    <div className={cn('mt-auto bg-sidebar/80 backdrop-blur-sm', showDivider && 'border-t border-border/70', isCollapsed ? 'px-2 pb-2 pt-2' : 'px-3 py-3')}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Color theme selector"
            className={cn(
              'group flex w-full items-center justify-between gap-2.5 rounded-xl border border-border/70 bg-background/55 px-2.5 py-2.5 text-left text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-primary/35 hover:bg-background/80 hover:shadow-(--theme-shadow) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar',
              isCollapsed && 'justify-center px-2 py-2.5',
            )}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className="block h-5 w-5 shrink-0 rounded-full ring-2 ring-background shadow-sm transition-transform duration-200 group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${selectedOption.swatch}, ${selectedOption.accent})`,
                }}
              />
              {!isCollapsed && (
                <span className="min-w-0 leading-tight">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">Color theme</span>
                  <span className="block truncate text-xs font-semibold text-foreground">{selectedOption.label}</span>
                </span>
              )}
            </span>
            {!isCollapsed && <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" side={isCollapsed ? 'right' : 'top'} sideOffset={8} className="w-56 rounded-xl border-border/80 bg-popover/95 p-2 shadow-(--theme-shadow-strong) backdrop-blur-md">
          <div className="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">Pilih warna tema</div>
          {colorThemeOptions.map((option) => {
            const isActive = selectedTheme === option.id;

            return (
              <DropdownMenuItem key={option.id} onSelect={() => setSelectedTheme(option.id)} className={cn('group/item flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 transition-all duration-150 hover:bg-primary/8 focus:bg-primary/8', isActive && 'bg-primary/10 text-foreground ring-1 ring-inset ring-primary/25')}>
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn('block h-5 w-5 shrink-0 rounded-full ring-2 ring-background shadow-sm transition-transform duration-150 group-hover/item:scale-110', isActive && 'ring-primary/30')}
                    style={{
                      background: `linear-gradient(135deg, ${option.swatch}, ${option.accent})`,
                    }}
                  />
                  <span className="truncate text-xs font-medium">{option.label}</span>
                </span>
                {isActive && <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
