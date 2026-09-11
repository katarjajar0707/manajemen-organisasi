'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PresenceUser, publishUserPresence } from '@/lib/user-presence';

const USER_PRESENCE_CHANNEL = 'organisasi-user-presence';

/**
 * Menandai pengguna yang sedang membuka portal pengurus lewat Supabase
 * Presence. Tidak menyimpan jejak ke database dan otomatis hilang ketika
 * koneksi/tab pengguna ditutup.
 */
export function UserPresenceTracker() {
  const pathname = usePathname();
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const connect = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active || !user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('nama, role, foto_url')
        .eq('id', user.id)
        .maybeSingle();

      if (!active) return;

      const channel = supabase.channel(USER_PRESENCE_CHANNEL, {
        config: { presence: { key: user.id, enabled: true } },
      });
      channelRef.current = channel;

      const publishPresence = (connectionState: 'connecting' | 'connected' | 'error' = 'connected') => {
        publishUserPresence({ users: channel.presenceState<PresenceUser>(), connectionState });
      };

      const track = () =>
        channel.track({
          userId: user.id,
          nama: profile?.nama || user.user_metadata?.nama || user.user_metadata?.full_name || user.email || 'Pengguna',
          role: profile?.role || 'anggota',
          fotoUrl: profile?.foto_url || null,
          halaman: pathname,
          aktifSejak: new Date().toISOString(),
        });

      channel
        .on('presence', { event: 'sync' }, () => publishPresence())
        .on('presence', { event: 'join' }, () => publishPresence())
        .on('presence', { event: 'leave' }, () => publishPresence())
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            publishPresence();
            void track();
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            publishPresence('error');
          }
        });

      const refreshPresence = () => {
        if (document.visibilityState === 'visible') void track();
      };
      document.addEventListener('visibilitychange', refreshPresence);

      return () => document.removeEventListener('visibilitychange', refreshPresence);
    };

    let removeVisibilityListener: (() => void) | undefined;
    void connect().then((cleanup) => {
      removeVisibilityListener = cleanup;
    });

    return () => {
      active = false;
      removeVisibilityListener?.();
      const channel = channelRef.current;
      channelRef.current = null;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [pathname]);

  return null;
}
