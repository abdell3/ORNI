"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth/auth.context";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", window.location.origin);
      loginUrl.searchParams.set("from", pathname ?? "");
      router.replace(loginUrl.toString());
    }
  }, [loading, isAuthenticated, router, pathname]);

  if (loading) {
    return <p className="p-6">Chargement...</p>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
