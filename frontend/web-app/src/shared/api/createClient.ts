import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";
import { authStore } from "@/features/auth/model/authStore";
import { isExpiringSoon } from "@/shared/api/jwt";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// Single instance for authed calls
export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

let refreshPromise: Promise<string | null> | null = null;

/**
 * Try to refresh the access token using one of:
 * 1) HttpOnly cookie (preferred): POST /auth/refresh with credentials
 * 2) In-memory refresh token: POST /auth/refresh with { refreshToken }
 */
async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { refreshToken } = authStore.getState();

      try {
        // Attempt cookie-based refresh first
        const cookieAttempt = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true, headers: { "Content-Type": "application/json" } }
        );

        if (cookieAttempt.status === 200 && cookieAttempt.data?.result?.accessToken) {
          const { accessToken, refreshToken: rotated } = cookieAttempt.data.result;
          authStore.getState().setAccessToken(accessToken ?? null);
          if (rotated) authStore.getState().setRefreshToken(rotated);
          return accessToken ?? null;
        }
      } catch {
        // fall through to body-based refresh if available
      }

      // If cookie flow didn’t work and we have a refreshToken in memory, try body flow
      if (refreshToken) {
        try {
          const bodyAttempt = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken },
            { headers: { "Content-Type": "application/json" } }
          );
          // Support both envelope and raw shapes
          const data = bodyAttempt.data?.result ?? bodyAttempt.data;
          const access = data?.accessToken ?? null;
          const rotated = data?.refreshToken;
          authStore.getState().setAccessToken(access);
          if (rotated) authStore.getState().setRefreshToken(rotated);
          return access;
        } catch {
          // ignore; we clear below
        }
      }

      authStore.getState().clear();
      return null;
    })().finally(() => (refreshPromise = null));
  }
  return refreshPromise;
}

// Request: inject token + proactive refresh
http.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = authStore.getState().accessToken;
    if (token && isExpiringSoon(token, 45)) {
      token = await refreshAccessToken();
    }
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
    // Default JSON header (unless FormData)
    if (!(config.data instanceof FormData) && !config.headers?.["Content-Type"]) {
      (config.headers as Record<string, string>)["Content-Type"] = "application/json";
    }
    return config;
  },
  (e) => Promise.reject(e)
);

// Response: on 401, refresh once then retry
http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (!error.response || !original) return Promise.reject(error);

    if (error.response.status === 401 && !original._retry) {
      original._retry = true;
      const newToken = await refreshAccessToken();
      if (!newToken) return Promise.reject(error);
      original.headers = original.headers ?? {};
      (original.headers as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;
      return http.request(original);
    }

    return Promise.reject(error);
  }
);
