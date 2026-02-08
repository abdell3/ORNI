"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchEvents } from "@/lib/api/client";
import { getEventReservations, type AdminReservation } from "@/lib/api/admin";
import { cancelReservation } from "@/lib/api/reservations";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "En attente",
    CONFIRMED: "Confirmée",
    REFUSED: "Refusée",
    CANCELED: "Annulée",
  };
  return labels[status] ?? status;
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const events = await fetchEvents();
      const lists = await Promise.all(
        events.map((event) => getEventReservations(event.id))
      );
      const flat = lists.flat();
      flat.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setReservations(flat);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCancel(id: string) {
    setActionLoading(id);
    try {
      await cancelReservation(id);
      load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'annulation"
      );
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div>
        <SectionTitle as="h1" className="mb-6">
          Gestion des réservations
        </SectionTitle>
        <p className="text-[#a1a1aa]">Chargement...</p>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle as="h1" className="mb-8">
        Gestion des réservations
      </SectionTitle>

      {error && <p className="mb-4 text-red-400">{error}</p>}

      {reservations.length === 0 ? (
        <Card>
          <p className="text-[#a1a1aa]">Aucune réservation.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-[#2d2d3a]">
                <th className="pb-3 text-left text-sm font-medium text-[#a1a1aa]">
                  Participant
                </th>
                <th className="pb-3 text-left text-sm font-medium text-[#a1a1aa]">
                  Email
                </th>
                <th className="pb-3 text-left text-sm font-medium text-[#a1a1aa]">
                  Événement
                </th>
                <th className="pb-3 text-left text-sm font-medium text-[#a1a1aa]">
                  Date réservation
                </th>
                <th className="pb-3 text-left text-sm font-medium text-[#a1a1aa]">
                  Statut
                </th>
                <th className="pb-3 text-right text-sm font-medium text-[#a1a1aa]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[#2d2d3a] last:border-0"
                >
                  <td className="py-3 text-white">
                    {r.user
                      ? `${r.user.firstName} ${r.user.lastName}`
                      : "—"}
                  </td>
                  <td className="py-3 text-[#a1a1aa]">
                    {r.user?.email ?? "—"}
                  </td>
                  <td className="py-3 text-[#a1a1aa]">{r.event.title}</td>
                  <td className="py-3 text-[#a1a1aa]">
                    {formatDate(r.createdAt)}
                  </td>
                  <td className="py-3 text-[#a1a1aa]">
                    {statusLabel(r.status)}
                  </td>
                  <td className="py-3 text-right">
                    {r.status !== "CANCELED" && r.status !== "REFUSED" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCancel(r.id)}
                        disabled={actionLoading === r.id}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        {actionLoading === r.id ? "..." : "Annuler"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
