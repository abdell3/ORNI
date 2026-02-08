"use client";

import Link from "next/link";
import { useState } from "react";
import { createReservation } from "@/lib/api/reservations";
import { useAuth } from "@/lib/auth/auth.context";
import { Button } from "@/components/ui/Button";

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
      setError(
        err instanceof Error ? err.message : "Erreur lors de la réservation."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthenticated) {
    const loginHref = `/login?from=${encodeURIComponent(`/events/${eventId}`)}`;
    return (
      <Link href={loginHref}>
        <Button size="lg">Se connecter pour réserver</Button>
      </Link>
    );
  }

  return (
    <div>
      <Button
        type="button"
        onClick={handleReserve}
        disabled={loading}
        size="lg"
      >
        {loading ? "Réservation..." : "Réserver"}
      </Button>
      {success && (
        <p className="mt-3 text-sm text-emerald-400">{success}</p>
      )}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
