"use client";

import { useEffect, useState } from "react";
import { fetchEvents } from "@/lib/api/client";
import {
  getAllUsers,
  getEventReservations,
} from "@/lib/api/admin";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | null;
  icon: string;
}) {
  return (
    <Card className="flex flex-col gap-2">
      <span className="text-2xl" aria-hidden>
        {icon}
      </span>
      <p className="text-sm font-medium text-[#a1a1aa]">{title}</p>
      <p className="text-2xl font-bold text-white">
        {value === null ? "—" : value}
      </p>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [eventsCount, setEventsCount] = useState<number | null>(null);
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [reservationsCount, setReservationsCount] = useState<number | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchEvents(), getAllUsers()])
      .then(([events, users]) => {
        if (cancelled) return;
        setError(null);
        setEventsCount(events.length);
        setUsersCount(users.length);
        return Promise.all(
          events.map((event) => getEventReservations(event.id))
        ).then((lists) => {
          if (cancelled) return;
          setReservationsCount(lists.flat().length);
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Erreur lors du chargement"
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div>
        <SectionTitle as="h1" className="mb-6">
          Tableau de bord
        </SectionTitle>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle as="h1" className="mb-8">
        Tableau de bord
      </SectionTitle>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Événements publiés"
          value={eventsCount}
          icon="📅"
        />
        <StatCard
          title="Utilisateurs inscrits"
          value={usersCount}
          icon="👤"
        />
        <StatCard
          title="Réservations"
          value={reservationsCount}
          icon="🎫"
        />
      </div>
    </div>
  );
}
