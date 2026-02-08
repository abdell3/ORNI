"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getAdminEvents, cancelEvent, publishEvent } from "@/lib/api/admin";
import type { Event } from "@/lib/types/event";
import { Button } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/SectionTitle";
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

function statusLabel(status: Event["status"]): string {
  const labels: Record<Event["status"], string> = {
    DRAFT: "Brouillon",
    PUBLISHED: "Publié",
    CANCELED: "Annulé",
  };
  return labels[status] ?? status;
}

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getAdminEvents()
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
      router.replace("/admin/events?published=1");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancel(id: string) {
    if (!confirm("Confirmer l'annulation ?")) return;
    setActionLoading(id);
    try {
      await cancelEvent(id);
      router.replace("/admin/events?canceled=1");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(null);
    }
  }

  const searchParams = useSearchParams();
  const created = searchParams.get("created");
  const updated = searchParams.get("updated");
  const published = searchParams.get("published");
  const canceled = searchParams.get("canceled");

  if (loading) {
    return (
      <div>
        <SectionTitle as="h1" className="mb-6">
          Gestion des événements
        </SectionTitle>
        <Loader />
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

      {created === "1" && (
        <Alert type="success" message="Événement créé." className="mb-4" />
      )}
      {updated === "1" && (
        <Alert type="success" message="Événement modifié." className="mb-4" />
      )}
      {published === "1" && (
        <Alert type="success" message="Événement publié." className="mb-4" />
      )}
      {canceled === "1" && (
        <Alert type="success" message="Événement annulé." className="mb-4" />
      )}
      {error && (
        <Alert type="error" message={error} className="mb-4" />
      )}

      {events.length === 0 ? (
        <EmptyState
          title="Aucun événement"
          description="Créez votre premier événement."
        >
          <Link href="/admin/events/new">
            <Button variant="secondary" size="sm">
              Créer un événement
            </Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
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
                <th className="pb-3 text-left text-sm font-medium text-[#a1a1aa]">
                  Statut
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
                  <td className="py-3 text-[#a1a1aa]">
                    {statusLabel(event.status)}
                  </td>
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
                          loading={actionLoading === event.id}
                        >
                          Publier
                        </Button>
                      )}
                      {event.status !== "CANCELED" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCancel(event.id)}
                          loading={actionLoading === event.id}
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          Annuler
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
    </div>
  );
}
