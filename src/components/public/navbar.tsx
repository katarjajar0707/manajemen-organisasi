'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PwaInstallPrompt } from '@/components/common/pwa-install-prompt';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { PreviewImage } from '@/components/common/preview-image';
import { cn } from '@/lib/utils';

const navigationItems = [
  { href: '/', label: 'Beranda' },
  { href: '/laporan-keuangan', label: 'Keuangan' },
  { href: '/kontak', label: 'Kontak' },
];

export function Navbar({ orgLogoUrl, orgName = 'KartaTuju', isLoggedIn = false }: { orgLogoUrl?: string | null; orgName?: string; isLoggedIn?: boolean }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !menuButtonRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
      <nav
        aria-label="Navigasi utama"
        className={cn(
          "relative mx-auto flex h-14 max-w-7xl items-center justify-between rounded-xl px-3 transition-all duration-300 sm:px-4",
          isScrolled
            ? "border border-border/80 bg-background/80 shadow-md backdrop-blur-md"
            : isHome
              ? "border border-white/20 dark:border-white/10 bg-background/50 shadow-sm backdrop-blur-md"
              : "border border-border/80 bg-background/85 shadow-sm backdrop-blur-md"
        )}
      >
        <Link href="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          {orgLogoUrl ? (
            <span className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border/80 bg-background shadow-sm">
              <PreviewImage src={orgLogoUrl} alt={`Logo ${orgName}`} className="h-full w-full object-cover" />
            </span>
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground shadow-sm" aria-hidden="true">KT</span>
          )}
          <span className="text-sm font-bold tracking-tight text-foreground sm:text-base">{orgName}</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="ml-2 flex items-center gap-2 border-l border-border/70 pl-3">
            <ThemeToggle />
            <Button asChild variant="default" size="sm" className="h-9 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
              {isLoggedIn ? <Link href="/dashboard">Dashboard</Link> : <Link href="/login">Masuk</Link>}
            </Button>
            <PwaInstallPrompt />
          </div>
        </div>

        <Button ref={menuButtonRef} type="button" variant="outline" size="icon" className="h-9 w-9 lg:hidden" aria-label={isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'} aria-expanded={isOpen} aria-controls="public-navigation-menu" onClick={() => setIsOpen((open) => !open)}>
          {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </Button>

        <div id="public-navigation-menu" ref={menuRef} className={cn('absolute right-0 top-[calc(100%+0.75rem)] w-64 origin-top-right rounded-xl border border-border/80 bg-popover/95 p-2 shadow-md backdrop-blur-md transition-all duration-200 ease-out lg:hidden', isOpen ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-2 scale-95 opacity-0')} aria-hidden={!isOpen}>
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  tabIndex={isOpen ? 0 : -1}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "bg-secondary text-foreground font-semibold"
                      : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="mt-2 space-y-2 border-t border-border/70 pt-2">
            <div className="flex items-center justify-between rounded-lg px-3 py-1.5 text-sm font-medium text-foreground">
              <span>Tema tampilan</span>
              <ThemeToggle />
            </div>
            <Button asChild variant="default" className="h-10 w-full justify-start bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" tabIndex={isOpen ? 0 : -1}>
              {isLoggedIn
                ? <Link href="/dashboard" onClick={closeMenu}>Dashboard</Link>
                : <Link href="/login" onClick={closeMenu}>Masuk</Link>
              }
            </Button>
            <div className="[&>button]:h-10 [&>button]:w-full [&>button]:justify-start">
              <PwaInstallPrompt />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
