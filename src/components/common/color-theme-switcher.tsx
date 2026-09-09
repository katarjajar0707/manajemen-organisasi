'use client';

import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type ColorTheme = 'green' | 'blue' | 'orange' | 'pink' | 'red';

const COLOR_THEME_STORAGE_KEY = 'karta-theme-color';

export const colorThemeOptions: Array<{ id: ColorTheme; label: string; swatch: string; accent: string }> = [
  { id: 'green', label: 'Green', swatch: '#10b981', accent: '#34d399' },
  { id: 'blue', label: 'Blue', swatch: '#3b82f6', accent: '#60a5fa' },
  { id: 'orange', label: 'Orange', swatch: '#f59e0b', accent: '#fb923c' },
  { id: 'pink', label: 'Pink', swatch: '#ec4899', accent: '#f472b6' },
  { id: 'red', label: 'Red', swatch: '#ef4444', accent: '#f87171' },
];

function getStoredColorTheme(): ColorTheme {
  if (typeof window === 'undefined') return 'green';

  const saved = window.localStorage.getItem(COLOR_THEME_STORAGE_KEY);
  if (saved && colorThemeOptions.some((option) => option.id === saved)) {
    return saved as ColorTheme;
  }

  return 'green';
}

export function ColorThemeSwitcher({ isCollapsed = false }: { isCollapsed?: boolean }) {
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
    <div className={cn('mt-auto border-t border-border/70 bg-sidebar/80 backdrop-blur-sm', isCollapsed ? 'px-2 pb-2 pt-2' : 'px-3 py-3')}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Color theme selector"
            className={cn(
              'flex w-full items-center justify-between gap-2 rounded-lg border border-border/70 bg-background/60 px-2.5 py-2 text-left text-sm font-medium text-foreground shadow-sm transition-all duration-150 hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar',
              isCollapsed && 'justify-center px-1.5 py-2',
            )}
          >
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="block h-4 w-4 shrink-0 rounded-full ring-2 ring-background"
                style={{
                  background: `linear-gradient(135deg, ${selectedOption.swatch}, ${selectedOption.accent})`,
                }}
              />
              {!isCollapsed && <span className="truncate">{selectedOption.label}</span>}
            </span>
            {!isCollapsed && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" side={isCollapsed ? 'right' : 'top'} className="w-52 p-1.5">
          {colorThemeOptions.map((option) => {
            const isActive = selectedTheme === option.id;

            return (
              <DropdownMenuItem key={option.id} onSelect={() => setSelectedTheme(option.id)} className={cn('flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5', isActive && 'bg-primary/8 text-foreground')}>
                <span className="flex items-center gap-3 min-w-0">
                  <span
                    className="block h-4 w-4 shrink-0 rounded-full ring-2 ring-background"
                    style={{
                      background: `linear-gradient(135deg, ${option.swatch}, ${option.accent})`,
                    }}
                  />
                  <span className="truncate">{option.label}</span>
                </span>
                {isActive && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
