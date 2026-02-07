"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { getAccessToken } from "@/lib/auth/auth.storage";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      const loginUrl = new URL("/login", window.location.origin);
      loginUrl.searchParams.set("from", pathname ?? "");
      router.replace(loginUrl.toString());
    }
  }, [router, pathname]);

  return <>{children}</>;
}
