"use client";

import { useEffect, useState } from "react";
import { getAdminStats } from "@/lib/api/admin";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Loader } from "@/components/ui/Loader";
import { Alert } from "@/components/ui/Alert";

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
  const [totalEvents, setTotalEvents] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalReservations, setTotalReservations] = useState<number | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getAdminStats()
      .then((stats) => {
        if (cancelled) return;
        setError(null);
        setTotalEvents(stats.totalEvents);
        setTotalUsers(stats.totalUsers);
        setTotalReservations(stats.totalReservations);
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
        <Alert type="error" message={error} />
      </div>
    );
  }

  if (totalEvents === null && totalUsers === null && totalReservations === null) {
    return (
      <div>
        <SectionTitle as="h1" className="mb-6">
          Tableau de bord
        </SectionTitle>
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <SectionTitle as="h1" className="mb-8">
        Tableau de bord
      </SectionTitle>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Événements" value={totalEvents} icon="📅" />
        <StatCard title="Utilisateurs" value={totalUsers} icon="👤" />
        <StatCard title="Réservations" value={totalReservations} icon="🎫" />
      </div>
    </div>
  );
}
