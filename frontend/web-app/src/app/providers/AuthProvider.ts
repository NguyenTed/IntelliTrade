import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { http } from "@/shared/api/createClient";
import { authStore } from "@/features/auth/model/authStore";

type AuthBootstrapCtx = { ready: boolean };
const AuthBootstrapContext = createContext<AuthBootstrapCtx>({ ready: false });

export function useAuthReady(): boolean {
  return useContext(AuthBootstrapContext).ready;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Silent sign-in using HttpOnly refresh cookie (correct endpoint)
        const res = await http.post("/auth/token/refresh", {}, { withCredentials: true });
        const accessToken = res.data?.result?.accessToken ?? res.data?.accessToken ?? null;

        if (!cancelled) {
          const { setAccessToken, clear, loadMe, user } = authStore.getState();

          if (accessToken) {
            // 1) Seed token in memory
            setAccessToken(accessToken);
            // 2) Load current user's profile (/profiles/me) only if we don't have user data
            if (!user) {
              try {
                await loadMe();
              } catch (error) {
                console.error("Failed to load user profile:", error);
                // If profile fetch fails, clear session to avoid half-authenticated state
                clear();
              }
            }
          } else {
            clear();
          }
        }
      } catch (error: any) {
        // 403 is expected when user is not logged in - don't log as error
        if (error?.response?.status === 403) {
          console.log("No active session found (403) - user needs to log in");
        } else {
          console.error("Auth bootstrap failed:", error);
        }
        if (!cancelled) {
          const { clear } = authStore.getState();
          clear();
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Render nothing until auth bootstrap completes to avoid flicker
  if (!ready) return null;

  return React.createElement(
    AuthBootstrapContext.Provider,
    { value: { ready } },
    children as any
  );
};

