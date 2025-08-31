import { http } from "@/shared/api/createClient";

export type ApiEnvelope<T> = { code: number; result: T; message?: string };
export type LoginDto = { identifier: string; password: string; remember?: boolean };
export type LoginResult = { accessToken: string }; // refresh comes via HttpOnly cookie

export async function login(dto: LoginDto): Promise<LoginResult> {
  try {
    const { data } = await http.post<ApiEnvelope<LoginResult>>(
      "/auth/token",
      dto,
      { withCredentials: true } // accept HttpOnly refresh cookie
    );

    if (data.code !== 1000 || !data.result) {
      throw new Error(data.message || "Login failed");
    }
    return data.result; // caller updates store (separation of concerns)
  } catch (e: any) {
    const msg = e?.response?.data?.message ?? e?.message ?? "Login failed";
    throw new Error(msg);
  }
}

// ---------- Signup (Registration) ----------
export type SignupDto = {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // expect 'YYYY-MM-DD' from <input type="date">
};

// Match backend response shape:
// {
//   "code": 1000,
//   "result": {
//     "id": "...",
//     "username": "...",
//     "email": "...",
//     "emailVerified": false,
//     "roles": [{ name: "USER", description: "User role", permissions: [] }]
//   }
// }
export type BackendUser = {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  roles: { name: string; description?: string; permissions: any[] }[];
};

export async function signup(dto: SignupDto): Promise<{ user: BackendUser }> {
  try {
    const { data } = await http.post<ApiEnvelope<BackendUser>>(
      "/auth/users/registration",
      dto
    );

    if (data.code !== 1000 || !data.result) {
      throw new Error(data.message || "Signup failed");
    }

    return { user: data.result };
  } catch (e: any) {
    const msg = e?.response?.data?.message ?? e?.message ?? "Signup failed";
    throw new Error(msg);
  }
}

// ---------- Current user profile (no roles here; derive roles from JWT claims) ----------
// ---------- Current user (from Profile service) ----------
export type AuthUser = {
  id: string;         // profile id
  userId: string;     // underlying auth user id
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dob: string;        // ISO date string (YYYY-MM-DD)
};

export async function getMe(): Promise<AuthUser> {
  const { data } = await http.get<ApiEnvelope<AuthUser>>("/profiles/me");
  if (data.code !== 1000 || !data.result) {
    throw new Error(data.message ?? "Failed to load profile");
  }
  return data.result;
}

// ---------- Logout ----------
export async function logout(): Promise<void> {
  try {
    // Call logout endpoint to invalidate tokens on server
    await http.post("/auth/token/logout", {}, { withCredentials: true });
  } catch (error) {
    // Even if server logout fails, we still clear local state
    console.warn("Server logout failed, clearing local state anyway:", error);
  }
}
