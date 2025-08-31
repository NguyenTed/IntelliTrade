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

// Extract roles from JWT claims (if present as "roles" or "scope")
export function getRolesFromToken(token: string | null): string[] {
  const p = decodeJwt(token);
  if (!p) return [];
  if (Array.isArray(p["roles"])) return p["roles"] as string[];
  if (typeof p["scope"] === "string") {
    return p["scope"].split(" ").filter((s) => s.startsWith("ROLE_"));
  }
  return [];
}

// Extract permissions from JWT claims (if present as "permissions" or within scope)
export function getPermissionsFromToken(token: string | null): string[] {
  const p = decodeJwt(token);
  if (!p) return [];
  if (Array.isArray(p["permissions"])) return p["permissions"] as string[];
  if (typeof p["scope"] === "string") {
    return p["scope"]
      .split(" ")
      .filter((s) => !s.startsWith("ROLE_") && s.trim().length > 0);
  }
  return [];
}
