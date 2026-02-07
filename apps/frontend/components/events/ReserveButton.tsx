"use client";

import Link from "next/link";
import { useState } from "react";
import { createReservation } from "@/lib/api/reservations";
import { useAuth } from "@/lib/auth/auth.context";

type ReserveButtonProps = {
  eventId: string;
};

export function ReserveButton({ eventId }: ReserveButtonProps) {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleReserve() {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await createReservation(eventId);
      setSuccess("Réservation enregistrée.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la réservation.");
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthenticated) {
    const loginHref = `/login?from=${encodeURIComponent(`/events/${eventId}`)}`;
    return (
      <p className="mt-4">
        <Link
          href={loginHref}
          className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Se connecter pour réserver
        </Link>
      </p>
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleReserve}
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Réservation..." : "Réserver"}
      </button>
      {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
