// src/features/profile/api/profileApi.ts
import { http } from "@/shared/api/createClient";

// ===== Types =====
export type UpdateProfileRequest = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dob: string;
};

export type Profile = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dob: string;
  userId: string;
  premium: boolean | null;
  planKey: string | null;
  premiumSince: string | null;
  premiumUntil: string | null;
};

type Envelope<T> = { code: number; result: T };

// ===== API =====
export async function getMyProfile(): Promise<Profile> {
  const res = await http.get<Envelope<Profile> | Profile>("/profiles/me");
  return (res.data as any)?.result ?? (res.data as any);
}

export async function updateMyProfile(
  payload: UpdateProfileRequest
): Promise<Profile> {
  const res = await http.put<Envelope<Profile> | Profile>(
    "/profiles/me",
    payload
  );
  return (res.data as any)?.result ?? (res.data as any);
}
