import { http } from "@/shared/api/createClient";
import { authStore } from "@/features/auth/model/authStore";

type ApiEnvelope<T> = { code: number; result: T; message?: string };
type LoginDto = { identifier: string; password: string; remember?: boolean };
type LoginResult = { accessToken: string }; // refresh comes via HttpOnly cookie

export async function login(dto: LoginDto) {
  const res = await http.post<ApiEnvelope<LoginResult>>(
    "/auth/token",
    dto,
    {
      withCredentials: true, // accept HttpOnly refresh cookie
      headers: { "Content-Type": "application/json" },
    }
  );

  if (res.data.code !== 1000) {
    throw new Error(res.data.message || "Login failed");
  }

  const { accessToken } = res.data.result;
  authStore.getState().setAccessToken(accessToken);
  // refresh token is cookie-only; do not store it in JS
  authStore.getState().setRefreshToken(null);

  // If your API also returns a user profile somewhere else, set it here.
  // authStore.getState().setUser(user);

  return true;
}

// ---------- Signup (Registration) ----------
type SignupDto = {
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
type BackendUser = {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  roles: { name: string; description?: string; permissions: any[] }[];
};

export async function signup(dto: SignupDto): Promise<{ user: BackendUser }> {
  try {
    const res = await http.post<ApiEnvelope<BackendUser>>(
      "/auth/users/registration",
      dto,
      {
        withCredentials: true, // harmless if backend doesn't set cookies on signup
        headers: { "Content-Type": "application/json" },
      }
    );

    if (res.data.code !== 1000 || !res.data.result) {
      throw new Error(res.data.message || "Signup failed");
    }

    // Do NOT set tokens here — your backend does not log in on signup.
    return { user: res.data.result };
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      "Signup failed";
    throw new Error(msg);
  }
}
