'use client';

import * as React from 'react';
import { Check, ChevronDown, Palette } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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

export function ColorThemeSwitcher({
  isCollapsed = false,
  showDivider = true,
  compact = false,
  label = 'Tema Warna',
  className,
}: {
  isCollapsed?: boolean;
  showDivider?: boolean;
  compact?: boolean;
  label?: string;
  className?: string;
}) {
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

  const triggerButton = compact ? (
    <button
      type="button"
      aria-label="Pilih tema warna aplikasi"
      className="group flex h-auto min-h-16 w-full items-center justify-between gap-3 whitespace-normal rounded-md border border-input bg-background px-3 py-2.5 text-left text-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground sm:min-h-20 sm:px-4 sm:py-3 cursor-pointer"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400 sm:h-9 sm:w-9">
          <Palette className="h-4 w-4" />
        </span>
        <span className="min-w-0 text-left">
          <span className="block text-sm font-medium text-foreground">{label}</span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[11px] font-normal text-muted-foreground sm:text-xs">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full shadow-xs ring-1 ring-border/50"
              style={{
                background: `linear-gradient(135deg, ${selectedOption.swatch}, ${selectedOption.accent})`,
              }}
            />
            <span className="truncate">{selectedOption.label}</span>
          </span>
        </span>
      </div>
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
    </button>
  ) : (
    <button
      type="button"
      aria-label="Pilih tema warna aplikasi"
      className={cn(
        'group flex w-full items-center justify-between gap-2.5 rounded-lg border border-border/60 bg-background/60 px-2.5 py-2 text-left text-foreground shadow-2xs transition-all duration-200 hover:border-primary/40 hover:bg-background/90 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99] cursor-pointer',
        isCollapsed && 'h-9 w-9 p-0 justify-center mx-auto border-transparent bg-transparent hover:bg-sidebar-accent hover:border-border/60'
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={cn(
            'relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border/60 shadow-2xs transition-transform duration-200 group-hover:scale-105',
            isCollapsed && 'h-7 w-7 rounded-lg'
          )}
          style={{
            background: `linear-gradient(135deg, ${selectedOption.swatch}25, ${selectedOption.accent}25)`,
          }}
        >
          <span
            className="block h-3 w-3 rounded-full ring-1.5 ring-background shadow-xs transition-transform duration-200 group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${selectedOption.swatch}, ${selectedOption.accent})`,
            }}
          />
        </span>
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 leading-tight">
              {label}
            </span>
            <span className="block truncate text-xs font-semibold text-foreground leading-tight mt-0.5">
              {selectedOption.label}
            </span>
          </div>
        )}
      </div>
      {!isCollapsed && (
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      )}
    </button>
  );

  return (
    <div
      className={cn(
        compact
          ? 'w-full'
          : cn(
              'mt-auto bg-sidebar/80 backdrop-blur-sm',
              showDivider && 'border-t border-border/60',
              isCollapsed ? 'p-2 flex justify-center' : 'p-3'
            ),
        className
      )}
    >
      <DropdownMenu>
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" className="text-xs font-medium">
              Tema: {selectedOption.label}
            </TooltipContent>
          </Tooltip>
        ) : (
          <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
        )}

        <DropdownMenuContent
          align={compact ? 'end' : isCollapsed ? 'center' : 'start'}
          side={compact ? 'bottom' : isCollapsed ? 'right' : 'top'}
          sideOffset={compact ? 6 : isCollapsed ? 12 : 8}
          className="w-56 rounded-xl border-border/80 bg-popover/95 p-1.5 shadow-(--theme-shadow-strong) backdrop-blur-md z-50"
        >
          <div className="px-2.5 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Pilih Warna Tema
          </div>
          {colorThemeOptions.map((option) => {
            const isActive = selectedTheme === option.id;

            return (
              <DropdownMenuItem
                key={option.id}
                onSelect={() => setSelectedTheme(option.id)}
                className={cn(
                  'group/item flex cursor-pointer items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 transition-all duration-150 hover:bg-primary/8 focus:bg-primary/8',
                  isActive && 'bg-primary/10 text-foreground font-medium ring-1 ring-inset ring-primary/25'
                )}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={cn(
                      'block h-4 w-4 shrink-0 rounded-full ring-2 ring-background shadow-xs transition-transform duration-150 group-hover/item:scale-110',
                      isActive && 'ring-primary/40'
                    )}
                    style={{
                      background: `linear-gradient(135deg, ${option.swatch}, ${option.accent})`,
                    }}
                  />
                  <span className="truncate text-xs font-medium">{option.label}</span>
                </span>
                {isActive && <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
