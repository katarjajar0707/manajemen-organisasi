'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowRight, Bell, CheckCheck, Loader2, LogOut, Moon, PanelLeft, Settings, Sun, User, Search } from 'lucide-react';
import { useSidebarStore } from '@/store/sidebar-store';
import { cn } from '@/lib/utils';
import React from 'react';
import { logout } from '@/actions/auth';
import { GlobalSearchDialog } from '@/components/common/global-search-dialog';
import { PreviewImage } from '@/components/common/preview-image';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import { getNotifikasi, markAllNotificationsAsRead, markNotificationAsRead, type AppNotification } from '@/actions/notifikasi';
import { formatNotificationDate, notificationStyle } from '@/components/notifikasi/notification-presentation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const NOTIFICATIONS_QUERY_KEY = ['notifications', 5] as const;

// Map segment URL → label yang terbaca
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  keuangan: 'Keuangan',
  catatan: 'Catatan',
  anggota: 'Anggota',
  struktur: 'Struktur',
  kegiatan: 'Kegiatan',
  diskusi: 'Diskusi',
  inventaris: 'Inventaris',
  arsip: 'Arsip & Surat',
  surat: 'Surat',
  pengumuman: 'Pengumuman',
  pengguna: 'Pengguna',
  bagian: 'Bagian',
  bendahara: 'Bendahara',
  masuk: 'Kas Masuk',
  keluar: 'Kas Keluar',
  agenda: 'Agenda',
  profil: 'Profil',
  pengaturan: 'Pengaturan',
  akses: 'Manajemen Akses',
  notifikasi: 'Notifikasi',
};

function buildCrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/');
    const isId = /^[0-9a-f-]{8,}$/i.test(seg);
    const label = isId ? 'Detail' : (SEGMENT_LABELS[seg] ?? seg);
    return { href, label, isLast: i === segments.length - 1 };
  });
}

interface AppHeaderProps {
  userRole?: string;
  userName?: string;
  userAvatarUrl?: string | null;
  userDepartemen?: string | null;
  notificationCount?: number;
  initialNotifications?: AppNotification[];
}

import { useAuthStore } from '@/store/auth-store';

export function AppHeader({ userRole: propUserRole, userName: propUserName, userAvatarUrl, userDepartemen: propUserDepartemen, notificationCount = 0, initialNotifications = [] }: AppHeaderProps) {
  const storeRole = useAuthStore((s) => s.userRole);
  const storeName = useAuthStore((s) => s.userName);
  const storeAvatarUrl = useAuthStore((s) => s.avatarUrl);
  const setAvatarUrl = useAuthStore((s) => s.setAvatarUrl);
  const setUserName = useAuthStore((s) => s.setUserName);
  const setUserRole = useAuthStore((s) => s.setUserRole);

  const userRole = propUserRole || storeRole || 'anggota';
  const userName = propUserName || storeName || 'Pengguna';
  // The effective avatar: store takes priority if set, otherwise fallback to server prop
  const avatarUrl = storeAvatarUrl !== null ? storeAvatarUrl : (userAvatarUrl ?? null);
  const departemen = propUserDepartemen || (userRole === 'admin' ? 'Administrator' : userRole === 'ketua' ? 'Pimpinan' : userRole === 'sekretaris' ? 'Sekretariat' : userRole === 'bendahara' ? 'Keuangan' : userRole);
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, theme, systemTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isLoggingOut, startLogoutTransition] = React.useTransition();
  const [imgError, setImgError] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(notificationCount);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const toggleSidebar = useSidebarStore((s) => s.toggle);
  const isSidebarCollapsed = useSidebarStore((s) => s.isCollapsed);

  const {
    data: notifications = initialNotifications,
    isLoading: isNotificationsLoading,
    isFetching: isNotificationsFetching,
  } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => getNotifikasi(5),
    initialData: initialNotifications.length > 0 ? initialNotifications : undefined,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const markNotificationAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (result, notificationId) => {
      if (!result.success) return;

      queryClient.setQueryData<AppNotification[]>(NOTIFICATIONS_QUERY_KEY, (current = []) => current.map((item) => (item.id === notificationId ? { ...item, dibaca: true } : item)));
      setUnreadCount((current) => Math.max(current - 1, 0));
      window.dispatchEvent(new CustomEvent('notifications-read', { detail: { count: Math.max(unreadCount - 1, 0) } }));
    },
  });

  const markAllNotificationsAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: (result) => {
      if (!result.success) return;

      queryClient.setQueryData<AppNotification[]>(NOTIFICATIONS_QUERY_KEY, (current = []) => current.map((notification) => ({ ...notification, dibaca: true })));
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent('notifications-read', { detail: { count: 0 } }));
    },
  });

  const isNotificationMutationPending = markNotificationAsReadMutation.isPending || markAllNotificationsAsReadMutation.isPending;

  const handleNotificationMenuChange = (open: boolean) => {
    setIsNotificationsOpen(open);
  };

  const handleNotificationOpen = (notification: AppNotification) => {
    setIsNotificationsOpen(false);
    if (!notification.dibaca) {
      void markNotificationAsReadMutation.mutateAsync(notification.id).finally(() => {
        router.push(notification.href);
      });
      return;
    }

    router.push(notification.href);
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    const unreadIds = notifications.filter((n) => !n.dibaca).map((n) => n.id);
    if (unreadIds.length === 0) return;
    void markAllNotificationsAsReadMutation.mutate(unreadIds);
  };

  const handleLogout = () => {
    startLogoutTransition(async () => {
      setAvatarUrl(null);
      setUserName('');
      await logout();
    });
  };

  // Sync server prop to store whenever userAvatarUrl prop changes
  React.useEffect(() => {
    if (userAvatarUrl !== undefined) {
      setAvatarUrl(userAvatarUrl);
    }
  }, [userAvatarUrl, setAvatarUrl]);

  React.useEffect(() => {
    if (propUserName) {
      setUserName(propUserName);
    }
    if (propUserRole) {
      setUserRole(propUserRole as any);
    }
  }, [propUserName, propUserRole, setUserName, setUserRole]);

  // Reset img error whenever avatarUrl changes
  React.useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  React.useEffect(() => {
    const supabase = createSupabaseClient();
    const handleNotificationsRead = (event: Event) => {
      const detail = (event as CustomEvent<{ count: number }>).detail;
      if (typeof detail?.count === 'number') setUnreadCount(detail.count);
    };
    const channel = supabase
      .channel('notifikasi-header')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifikasi' }, () => {
        setUnreadCount((current) => current + 1);
        void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      })
      .subscribe();

    window.addEventListener('notifications-read', handleNotificationsRead);

    return () => {
      window.removeEventListener('notifications-read', handleNotificationsRead);
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Listen to immediate custom events for avatar changes (optimistic updates from other components)
  React.useEffect(() => {
    const handleAvatarEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ url: string | null }>;
      if (customEvent.detail && 'url' in customEvent.detail) {
        setAvatarUrl(customEvent.detail.url);
      }
    };
    window.addEventListener('user-avatar-updated', handleAvatarEvent);
    return () => {
      window.removeEventListener('user-avatar-updated', handleAvatarEvent);
    };
  }, [setAvatarUrl]);

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  const crumbs = buildCrumbs(pathname);
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const toggleMobile = useSidebarStore((s) => s.toggleMobile);

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border/50 bg-background/30 px-3 shadow-sm backdrop-blur-sm transition-colors duration-200 sm:px-4 dark:bg-background/70">
      {/* ── Sisi Kiri: Toggle Sidebar + Breadcrumb ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        {/* Mobile Hamburger Drawer Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleMobile} className="lg:hidden h-8 w-8 text-foreground hover:bg-accent shrink-0 rounded-lg" title="Buka Menu Navigasi">
          <PanelLeft className="h-4 w-4" />
          <span className="sr-only">Buka menu drawer</span>
        </Button>

        {/* Desktop Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden lg:flex h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
          title={isSidebarCollapsed ? 'Buka Sidebar (Expanded)' : 'Tutup Sidebar (Collapsed)'}
        >
          <PanelLeft className={cn('h-4 w-4 transition-transform duration-200', isSidebarCollapsed && 'rotate-180')} />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {crumbs
              .filter((c) => c.href !== '/dashboard')
              .map((crumb) => (
                <React.Fragment key={crumb.href}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {crumb.isLast ? (
                      <BreadcrumbPage className="font-medium text-foreground truncate max-w-[150px] sm:max-w-xs">{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href} className="text-muted-foreground hover:text-foreground">
                          {crumb.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="sm:hidden font-semibold text-xs sm:text-sm truncate max-w-[180px]">{crumbs[crumbs.length - 1]?.label ?? 'Dashboard'}</div>
      </div>

      {/* ── Sisi Kanan: Search, Role Badge & Profile Dropdown ── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Global Search Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSearchOpen(true)}
          className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground px-2.5 sm:px-3 bg-muted/40 border-border/70"
          title="Cari Modul & Navigasi Cepat (Ctrl+K)"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Cari modul...</span>
          <kbd className="hidden md:inline-flex text-[10px] bg-background border border-border px-1.5 py-0.5 rounded font-mono text-muted-foreground">⌘K</kbd>
        </Button>

        <span title={`Departemen: ${departemen}`} className={cn('hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md', 'bg-primary/10 text-primary border border-primary/20')}>
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span>Departemen: {departemen}</span>
        </span>

        <DropdownMenu open={isNotificationsOpen} onOpenChange={handleNotificationMenuChange}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:h-8 sm:w-8"
              title={unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Notifikasi'}
              aria-label={unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Notifikasi'}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-background bg-destructive px-0.5 text-[9px] font-bold leading-none text-destructive-foreground sm:-right-1 sm:-top-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} collisionPadding={12} className="w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] sm:max-w-sm sm:w-96 overflow-hidden p-0 rounded-md shadow-xl border border-border/80">
            <DropdownMenuLabel className="flex items-center justify-between border-b border-border/60 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-muted/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight">Notifikasi</span>
                {isNotificationsFetching && !isNotificationsLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" aria-label="Memperbarui notifikasi" />}
                {unreadCount > 0 && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary">{unreadCount} baru</span>}
              </div>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={isNotificationMutationPending}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors py-1 px-1.5 rounded hover:bg-primary/10 active:scale-95 disabled:opacity-50"
                  title="Tandai semua sebagai sudah dibaca"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Tandai dibaca</span>
                </button>
              ) : (
                <span className="text-[11px] font-medium text-muted-foreground">Semua terbaca</span>
              )}
            </DropdownMenuLabel>
            <div className="max-h-[min(24rem,calc(100dvh-10rem))] overflow-y-auto overscroll-contain divide-y divide-border/50">
              {isNotificationsLoading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-8 text-center text-sm text-muted-foreground gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-xs">Memuat notifikasi...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex min-h-36 flex-col items-center justify-center px-4 py-6 text-center sm:min-h-44 sm:py-8">
                  <span className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground sm:h-10 sm:w-10">
                    <Bell className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-semibold">Belum ada notifikasi</p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-[16rem]">Pembaruan aktivitas organisasi akan muncul di sini.</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const style = notificationStyle[notification.tipe];
                  const Icon = style.icon;
                  return (
                    <DropdownMenuItem
                      key={notification.id}
                      onSelect={() => handleNotificationOpen(notification)}
                      disabled={isNotificationMutationPending}
                      className={cn(
                        'flex items-start gap-2.5 sm:gap-3 rounded-none px-3.5 py-3 sm:px-4 text-left cursor-pointer transition-colors focus:bg-muted/70 active:bg-muted/80',
                        !notification.dibaca ? 'bg-primary/[0.05] border-l-2 border-l-primary' : 'border-l-2 border-l-transparent hover:bg-muted/40',
                      )}
                    >
                      <span className={cn('mt-0.5 flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg shadow-2xs', style.className)}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-1.5">
                          <span className={cn('text-xs sm:text-sm leading-snug line-clamp-2', !notification.dibaca ? 'font-bold text-foreground' : 'font-semibold text-foreground/90')}>{notification.judul}</span>
                          {!notification.dibaca && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary ring-2 ring-primary/20" aria-label="Belum dibaca" />}
                        </span>
                        {notification.pesan && <span className="mt-1 block text-xs leading-relaxed text-muted-foreground line-clamp-2">{notification.pesan}</span>}
                        <span suppressHydrationWarning className="mt-1.5 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-muted-foreground">
                          <span className="font-medium text-foreground/75">{style.label}</span>
                          <span>·</span>
                          <span>{formatNotificationDate(notification.createdAt)}</span>
                        </span>
                      </span>
                    </DropdownMenuItem>
                  );
                })
              )}
            </div>
            <DropdownMenuSeparator className="my-0" />
            <DropdownMenuItem asChild className="group justify-center rounded-none px-4 py-2.5 sm:py-3 font-semibold text-xs sm:text-sm text-primary focus:bg-primary/10 focus:text-primary active:bg-primary/15 cursor-pointer">
              <Link href="/notifikasi" onClick={() => setIsNotificationsOpen(false)} className="flex items-center justify-center gap-1.5 w-full">
                <span>Lihat semua notifikasi</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn('flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden shrink-0', 'text-primary-foreground font-bold text-xs', 'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40')}
              style={
                !avatarUrl || imgError
                  ? {
                      backgroundImage: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-strong)))',
                      boxShadow: '0 0 12px var(--primary-glow)',
                    }
                  : undefined
              }
            >
              {avatarUrl && !imgError ? <PreviewImage src={avatarUrl} alt={userName} onError={() => setImgError(true)} className="h-full w-full object-cover" /> : initials || 'KT'}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 mt-1">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-0.5">
                <span className="text-sm font-semibold">{userName}</span>
                <span className="text-xs text-muted-foreground">
                  Departemen: <span className="font-medium text-foreground capitalize">{departemen}</span>
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Profil */}
            <DropdownMenuItem asChild>
              <Link href="/profil" className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Profil Saya</span>
              </Link>
            </DropdownMenuItem>

            {/* Pengaturan Khusus Admin */}
            {userRole === 'admin' && (
              <DropdownMenuItem asChild>
                <Link href="/pengaturan" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Pengaturan Sistem</span>
                </Link>
              </DropdownMenuItem>
            )}

            {/* Ganti Tema */}
            <DropdownMenuItem onClick={() => setTheme(isDark ? 'light' : 'dark')} className="flex items-center gap-2 cursor-pointer">
              {isDark ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
              <span>{isDark ? 'Mode Terang' : 'Mode Gelap'}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
              {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              <span>{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Global Search Dialog Modal */}
      <GlobalSearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </header>
  );
}
