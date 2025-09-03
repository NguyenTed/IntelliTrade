import { getMe, logout as logoutApi } from "@/features/auth/api/authApi";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  userId: string;
  username: string;
  email: string;
  premium: boolean;
  firstName: string;
  lastName: string;
  dob: string; // ISO date string
  planKey: string;
  premiumSince: string;
  premiumUntil: string;
} | null;

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null; // keep ONLY in memory (do not persist)
  user: AuthUser;
  isLoading: boolean;
  setAccessToken: (t: string | null) => void;
  setRefreshToken: (t: string | null) => void;
  setUser: (u: AuthUser) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
  loadMe: () => Promise<void>;
  logout: () => Promise<void>;
};

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isLoading: false,
      setAccessToken: (t) => set({ accessToken: t }),
      setRefreshToken: (t) => set({ refreshToken: t }),
      setUser: (u) => set({ user: u }),
      setLoading: (loading) => set({ isLoading: loading }),
      clear: () => set({ accessToken: null, refreshToken: null, user: null, isLoading: false }),
      loadMe: async () => {
        try {
          set({ isLoading: true });
          const res = await getMe();
          set({ user: res, isLoading: false });
        } catch (error) {
          console.error("Failed to fetch profile:", error);
          set({ isLoading: false });
          throw error;
        }
      },
      logout: async () => {
        try {
          set({ isLoading: true });
          
          // Call server logout endpoint
          await logoutApi();
          
          // Clear local state
          set({ accessToken: null, refreshToken: null, user: null, isLoading: false });
        } catch (error) {
          console.error("Error during logout:", error);
          // Still clear local state even if server logout fails
          set({ accessToken: null, refreshToken: null, user: null, isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ 
        user: state.user, // Persist user data
        // Don't persist tokens for security reasons
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to rehydrate auth storage:", error);
        } else {
          console.log("Auth storage rehydrated:", { hasUser: !!state?.user });
        }
      },
    }
  )
);
