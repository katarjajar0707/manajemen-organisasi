export const USER_PRESENCE_EVENT = 'organisasi-user-presence-updated';

export interface PresenceUser {
  userId: string;
  nama: string;
  role: string;
  fotoUrl?: string | null;
  halaman?: string;
  aktifSejak?: string;
}

export interface UserPresenceSnapshot {
  users: Record<string, PresenceUser[]>;
  connectionState: 'connecting' | 'connected' | 'error';
}

declare global {
  interface Window {
    __organisasiUserPresence?: UserPresenceSnapshot;
  }
}

export function getUserPresenceSnapshot(): UserPresenceSnapshot {
  if (typeof window === 'undefined') return { users: {}, connectionState: 'connecting' };
  return window.__organisasiUserPresence || { users: {}, connectionState: 'connecting' };
}

export function publishUserPresence(snapshot: UserPresenceSnapshot) {
  window.__organisasiUserPresence = snapshot;
  window.dispatchEvent(new CustomEvent<UserPresenceSnapshot>(USER_PRESENCE_EVENT, { detail: snapshot }));
}
