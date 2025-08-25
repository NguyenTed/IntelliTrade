import { create } from "zustand";

export type User = { id: string; email?: string; username?: string; roles?: string[] } | null;

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null; // keep ONLY in memory (do not persist)
  user: User;
  setAccessToken: (t: string | null) => void;
  setRefreshToken: (t: string | null) => void;
  setUser: (u: User) => void;
  clear: () => void;
};

export const authStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  setAccessToken: (t) => set({ accessToken: t }),
  setRefreshToken: (t) => set({ refreshToken: t }),
  setUser: (u) => set({ user: u }),
  clear: () => set({ accessToken: null, refreshToken: null, user: null }),
}));
