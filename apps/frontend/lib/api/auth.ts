import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  User,
} from "@/lib/auth/auth.types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof (data as { message?: string }).message === "string"
        ? (data as { message: string }).message
        : `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export async function apiLogin(body: LoginDto): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<AuthResponse>(res);
}

export async function apiRegister(
  body: RegisterDto
): Promise<{ id: string; email: string; firstName: string; lastName: string; role: string }> {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiRefresh(refreshToken: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function apiLogout(refreshToken: string): Promise<void> {
  const res = await fetch(`${BASE}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message =
      typeof (data as { message?: string }).message === "string"
        ? (data as { message: string }).message
        : `HTTP ${res.status}`;
    throw new Error(message);
  }
}

export async function getProfile(accessToken: string): Promise<User> {
  const res = await fetch(`${BASE}/users/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse<User>(res);
}
