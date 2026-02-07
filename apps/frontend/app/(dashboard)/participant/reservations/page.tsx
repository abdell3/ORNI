"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMyReservations } from "@/lib/api/reservations";
import type { Reservation } from "@/lib/types/reservation";

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function statusLabel(status: Reservation["status"]): string {
  const labels: Record<Reservation["status"], string> = {
    PENDING: "En attente",
    CONFIRMED: "Confirmée",
    REFUSED: "Refusée",
    CANCELED: "Annulée",
  };
  return labels[status] ?? status;
}

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyReservations()
      .then((data) => {
        if (!cancelled) setReservations(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erreur");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="p-6">
        <h1 className="mb-6 text-2xl font-semibold">Mes réservations</h1>
        <p className="text-zinc-600">Chargement...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <h1 className="mb-6 text-2xl font-semibold">Mes réservations</h1>
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="mb-6 text-2xl font-semibold">Mes réservations</h1>
      {reservations.length === 0 ? (
        <p className="text-zinc-600">Aucune réservation pour le moment.</p>
      ) : (
        <ul className="space-y-4">
          {reservations.map((r) => (
            <li
              key={r.id}
              className="rounded border border-zinc-200 p-4"
            >
              <Link
                href={`/events/${r.eventId}`}
                className="font-medium text-blue-600 underline"
              >
                {r.event.title}
              </Link>
              <p className="mt-1 text-sm text-zinc-600">
                {formatDate(r.event.date)} — {r.event.location}
              </p>
              <p className="mt-1 text-sm">
                Statut : {statusLabel(r.status)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
