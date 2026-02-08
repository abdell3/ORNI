"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth.context";
import { isAdmin } from "@/lib/auth/roles";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const showAdmin = isAdmin(user);

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#2d2d3a] bg-[#0b0b0f]/95 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-semibold text-white transition hover:text-[#a1a1aa]"
        >
          ORNI
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/"
            className="text-sm text-[#a1a1aa] transition hover:text-white"
          >
            Accueil
          </Link>
          <Link
            href="/events"
            className="text-sm text-[#a1a1aa] transition hover:text-white"
          >
            Événements
          </Link>
          {isAuthenticated ? (
            <>
              {showAdmin && (
                <Link
                  href="/admin"
                  className="text-sm text-[#a1a1aa] transition hover:text-white"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/participant/reservations"
                className="text-sm text-[#a1a1aa] transition hover:text-white"
              >
                Mes réservations
              </Link>
              <Link
                href="/participant"
                className="text-sm text-[#a1a1aa] transition hover:text-white"
              >
                Profil
              </Link>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                className="border-[#2d2d3a]"
              >
                Déconnexion
              </Button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-[#4f46e5] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#4338ca]"
            >
              Connexion
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
