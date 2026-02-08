"use client";

import Link from "next/link";
import { useState } from "react";
import { createReservation } from "@/lib/api/reservations";
import { useAuth } from "@/lib/auth/auth.context";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

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
      setSuccess("Réservation confirmée.");
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
    <div className="space-y-3">
      <Button
        type="button"
        onClick={handleReserve}
        loading={loading}
        size="lg"
      >
        Réserver
      </Button>
      {success && <Alert type="success" message={success} />}
      {error && <Alert type="error" message={error} />}
    </div>
  );
}
