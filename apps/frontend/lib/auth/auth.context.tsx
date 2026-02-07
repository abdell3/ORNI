"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getProfile } from "@/lib/api/auth";
import { getAccessToken } from "@/lib/auth/auth.storage";
import {
  getStoredAccessToken,
  login as serviceLogin,
  logout as serviceLogout,
  refreshToken as serviceRefreshToken,
} from "@/lib/auth/auth.service";
import type { LoginDto, User } from "@/lib/auth/auth.types";
import { clearTokens } from "@/lib/auth/auth.storage";

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function normalizeUser(data: Record<string, unknown>): User {
  return {
    id: String(data.id),
    email: String(data.email),
    role: String(data.role),
    firstName: String(data.firstName),
    lastName: String(data.lastName),
    createdAt: String(data.createdAt),
    updatedAt: String(data.updatedAt),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (token: string) => {
    const data = await getProfile(token);
    setUser(normalizeUser(data as unknown as Record<string, unknown>));
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    getProfile(token)
      .then((data) => {
        setUser(normalizeUser(data as unknown as Record<string, unknown>));
      })
      .catch(() => {
        clearTokens();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = useCallback(
    async (dto: LoginDto) => {
      await serviceLogin(dto);
      const token = getStoredAccessToken();
      if (token) {
        await loadProfile(token);
      }
    },
    [loadProfile]
  );

  const logout = useCallback(async () => {
    await serviceLogout();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    const ok = await serviceRefreshToken();
    if (!ok) {
      setUser(null);
      return;
    }
    const token = getStoredAccessToken();
    if (token) {
      try {
        await loadProfile(token);
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [loadProfile]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    refresh,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
