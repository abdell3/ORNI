"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchEvents } from "@/lib/api/client";
import { cancelEvent, publishEvent } from "@/lib/api/admin";
import type { Event } from "@/lib/types/event";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchEvents()
      .then(setEvents)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Erreur")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handlePublish(id: string) {
    setActionLoading(id);
    try {
      await publishEvent(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancel(id: string) {
    setActionLoading(id);
    try {
      await cancelEvent(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div>
        <SectionTitle as="h1" className="mb-6">
          Gestion des événements
        </SectionTitle>
        <p className="text-[#a1a1aa]">Chargement...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionTitle as="h1">Gestion des événements</SectionTitle>
        <Link href="/admin/events/new">
          <Button size="md">Créer un événement</Button>
        </Link>
      </div>

      {error && (
        <p className="mb-4 text-red-400">{error}</p>
      )}

      {events.length === 0 ? (
        <Card>
          <p className="text-[#a1a1aa]">Aucun événement publié.</p>
          <Link href="/admin/events/new" className="mt-4 inline-block">
            <Button variant="secondary" size="sm">
              Créer un événement
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr className="border-b border-[#2d2d3a]">
                <th className="pb-3 text-left text-sm font-medium text-[#a1a1aa]">
                  Titre
                </th>
                <th className="pb-3 text-left text-sm font-medium text-[#a1a1aa]">
                  Date
                </th>
                <th className="pb-3 text-left text-sm font-medium text-[#a1a1aa]">
                  Lieu
                </th>
                <th className="pb-3 text-left text-sm font-medium text-[#a1a1aa]">
                  Capacité
                </th>
                <th className="pb-3 text-right text-sm font-medium text-[#a1a1aa]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-[#2d2d3a] last:border-0"
                >
                  <td className="py-3 text-white">{event.title}</td>
                  <td className="py-3 text-[#a1a1aa]">
                    {formatDate(event.date)}
                  </td>
                  <td className="py-3 text-[#a1a1aa]">{event.location}</td>
                  <td className="py-3 text-[#a1a1aa]">{event.capacity}</td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/events/${event.id}/edit`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={!!actionLoading}
                        >
                          Modifier
                        </Button>
                      </Link>
                      {event.status === "DRAFT" && (
                        <Button
                          size="sm"
                          onClick={() => handlePublish(event.id)}
                          disabled={actionLoading === event.id}
                        >
                          {actionLoading === event.id
                            ? "Publication..."
                            : "Publier"}
                        </Button>
                      )}
                      {event.status !== "CANCELED" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCancel(event.id)}
                          disabled={actionLoading === event.id}
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          {actionLoading === event.id ? "..." : "Annuler"}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-sm text-[#71717a]">
        Seuls les événements publiés sont affichés. Les brouillons créés
        n&apos;apparaissent pas tant que le backend n&apos;expose pas une liste
        complète pour l&apos;admin.
      </p>
    </div>
  );
}
