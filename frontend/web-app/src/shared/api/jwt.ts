export type JwtPayload = { exp?: number; [k: string]: unknown };

export function decodeJwt(token: string | null): JwtPayload | null {
  if (!token) return null;
  const [, payload] = token.split(".");
  if (!payload) return null;
  try {
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch { return null; }
}

export function secondsUntilExpiry(token: string | null): number | null {
  const p = decodeJwt(token);
  if (!p?.exp) return null;
  return p.exp - Math.floor(Date.now() / 1000);
}

export function isExpiringSoon(token: string | null, thresholdSec = 60) {
  const s = secondsUntilExpiry(token);
  return s !== null && s <= thresholdSec;
}
