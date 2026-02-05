import Link from "next/link";
import { fetchEvents } from "@/lib/api/client";

export const dynamic = "force-dynamic";

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function EventsPage() {
  const events = await fetchEvents();

  return (
    <main className="p-6">
      <h1 className="mb-6 text-2xl font-semibold">Événements</h1>
      <ul className="space-y-4">
        {events.map((event) => (
          <li key={event.id}>
            <Link
              href={`/events/${event.id}`}
              className="block rounded border border-zinc-200 p-4 transition hover:bg-zinc-50"
            >
              <span className="font-medium">{event.title}</span>
              <span className="mx-2">—</span>
              <span className="text-zinc-600">{formatDate(event.date)}</span>
              <span className="mx-2">—</span>
              <span className="text-zinc-600">{event.location}</span>
            </Link>
          </li>
        ))}
      </ul>
      {events.length === 0 && (
        <p className="text-zinc-600">Aucun événement pour le moment.</p>
      )}
    </main>
  );
}
