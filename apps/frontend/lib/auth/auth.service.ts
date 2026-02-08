import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/auth/auth.storage";
import type { LoginDto, RegisterDto } from "@/lib/auth/auth.types";
import {
  apiLogin,
  apiLogout,
  apiRefresh,
  apiRegister,
} from "@/lib/api/auth";

export async function login(dto: LoginDto): Promise<void> {
  const { accessToken, refreshToken } = await apiLogin(dto);
  setTokens(accessToken, refreshToken);
}

export async function register(dto: RegisterDto): Promise<void> {
  await apiRegister(dto);
}

export async function refreshToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const { accessToken, refreshToken } = await apiRefresh(refresh);
    setTokens(accessToken, refreshToken);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

export async function logout(): Promise<void> {
  const refresh = getRefreshToken();
  if (refresh) {
    try {
      await apiLogout(refresh);
    } catch {
      // Invalidate locally anyway
    }
  }
  clearTokens();
}

export function getStoredAccessToken(): string | null {
  return getAccessToken();
}

export function getStoredRefreshToken(): string | null {
  return getRefreshToken();
}

/**
 * Fetch with Bearer token. On 401, tries refresh once and retries.
 * Use for protected API calls.
 */
export async function fetchWithAuth(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const token = getAccessToken();
  const res = await fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (res.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      const newToken = getAccessToken();
      return fetch(url, {
        ...init,
        headers: {
          ...init?.headers,
          ...(newToken && { Authorization: `Bearer ${newToken}` }),
        },
      });
    }
  }
  return res;
}
