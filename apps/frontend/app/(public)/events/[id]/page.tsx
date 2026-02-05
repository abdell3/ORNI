import Link from "next/link";
import { fetchEventById } from "@/lib/api/client";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;

  let event;
  try {
    event = await fetchEventById(id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message === "NOT_FOUND") {
      return (
        <main className="p-6">
          <h1 className="mb-4 text-xl font-semibold">Événement introuvable</h1>
          <Link href="/events" className="text-blue-600 underline">
            Retour à la liste des événements
          </Link>
        </main>
      );
    }
    throw err;
  }

  const placesRestantes = event.capacity - event.confirmedReservations;

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">{event.title}</h1>
      <p className="mb-2 text-zinc-600">{event.description}</p>
      <dl className="space-y-2">
        <dt className="font-medium">Date</dt>
        <dd className="text-zinc-600">{formatDate(event.date)}</dd>
        <dt className="font-medium">Lieu</dt>
        <dd className="text-zinc-600">{event.location}</dd>
        <dt className="font-medium">Capacité</dt>
        <dd className="text-zinc-600">{event.capacity}</dd>
        <dt className="font-medium">Places restantes</dt>
        <dd className="text-zinc-600">{placesRestantes}</dd>
      </dl>
      <Link
        href="/events"
        className="mt-6 inline-block text-blue-600 underline"
      >
        Retour à la liste des événements
      </Link>
    </main>
  );
}
