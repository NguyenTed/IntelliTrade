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
          if (accessToken) {
            authStore.getState().setAccessToken(accessToken);
          } else {
            authStore.getState().clear();
          }
        }
        // If your API returns user info, set it here:
        // const user = res.data?.result?.user;
        // if (!cancelled && user) authStore.getState().setUser(user);
      } catch {
        if (!cancelled) authStore.getState().clear();
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

  return (
    <AuthBootstrapContext.Provider value={{ ready }}>
      {children}
    </AuthBootstrapContext.Provider>
  );
};
