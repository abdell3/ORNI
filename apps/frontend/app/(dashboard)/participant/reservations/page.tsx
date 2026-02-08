"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getMyReservations } from "@/lib/api/reservations";
import type { Reservation } from "@/lib/types/reservation";
import { ReservationActions } from "@/components/reservations/ReservationActions";
import { Container } from "@/components/layout/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";

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

  const reloadReservations = useCallback(() => {
    getMyReservations()
      .then(setReservations)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"));
  }, []);

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
      <div className="py-10">
        <Container>
          <SectionTitle as="h1" className="mb-6">
            Mes réservations
          </SectionTitle>
          <Loader />
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10">
        <Container>
          <SectionTitle as="h1" className="mb-6">
            Mes réservations
          </SectionTitle>
          <Alert type="error" message={error} />
        </Container>
      </div>
    );
  }

  return (
    <div className="py-10 md:py-14">
      <Container>
        <SectionTitle as="h1" className="mb-8">
          Mes réservations
        </SectionTitle>
        {reservations.length === 0 ? (
          <EmptyState
            title="Aucune réservation"
            description="Aucune réservation pour le moment."
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {reservations.map((r) => (
              <li key={r.id}>
                <Card>
                  <Link
                    href={`/events/${r.eventId}`}
                    className="font-semibold text-white hover:text-[#4f46e5] hover:underline"
                  >
                    {r.event.title}
                  </Link>
                  <p className="mt-1 text-sm text-[#a1a1aa]">
                    {formatDate(r.event.date)} — {r.event.location}
                  </p>
                  <p className="mt-2 text-sm">
                    <span className="text-[#71717a]">Statut : </span>
                    <span className="text-white">{statusLabel(r.status)}</span>
                  </p>
                  <ReservationActions
                    reservation={r}
                    onUpdated={reloadReservations}
                  />
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </div>
  );
}
