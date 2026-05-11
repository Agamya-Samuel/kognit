import { atom } from 'jotai';

// ─── Auth State ───────────────────────────────────────────────────────────────

interface AuthState {
  isAuthenticated: boolean;
  userId: number | null;
  email: string | null;
  role: string | null;
}

export const authAtom = atom<AuthState>({
  isAuthenticated: false,
  userId: null,
  email: null,
  role: null,
});

export const accessTokenAtom = atom<string | null>(null);

// ─── UI State ─────────────────────────────────────────────────────────────────

export const sidebarOpenAtom = atom<boolean>(true);

export const themeAtom = atom<'light' | 'dark'>('light');
