import Link from "next/link";
import type { Event } from "@/lib/types/event";

type EventCardProps = {
  event: Event;
};

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function EventCard({ event }: EventCardProps) {
  const placesRestantes = event.capacity - event.confirmedReservations;

  return (
    <article className="group rounded-[var(--radius)] bg-[#111118] p-5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.2),0_2px_4px_-2px_rgba(0,0,0,0.15)] transition hover:shadow-lg hover:shadow-black/20">
      <h3 className="text-lg font-semibold text-white line-clamp-2">
        {event.title}
      </h3>
      <p className="mt-2 text-sm text-[#a1a1aa]">{formatDate(event.date)}</p>
      <p className="mt-0.5 text-sm text-[#a1a1aa]">{event.location}</p>
      <p className="mt-2 text-xs text-[#71717a]">
        {placesRestantes} place{placesRestantes !== 1 ? "s" : ""} restante
        {placesRestantes !== 1 ? "s" : ""}
      </p>
      <Link
        href={`/events/${event.id}`}
        className="mt-4 inline-block rounded-lg bg-[#4f46e5] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4338ca]"
      >
        Voir détails
      </Link>
    </article>
  );
}
