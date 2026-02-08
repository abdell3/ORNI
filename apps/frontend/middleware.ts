import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware ne vérifie plus l'auth (tokens en localStorage uniquement, inaccessibles côté serveur).
 * La protection des routes privées est assurée côté client dans (dashboard)/layout.tsx via AuthGuard.
 */
export function middleware(request: NextRequest) {
  void request;
  return NextResponse.next();
}
