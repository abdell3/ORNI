import Link from "next/link";
import { fetchEventById } from "@/lib/api/client";
import { ReserveButton } from "@/components/events/ReserveButton";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";

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
        <div className="py-10">
          <Container>
            <Card>
              <h1 className="text-xl font-semibold text-white">
                Événement introuvable
              </h1>
              <Link
                href="/events"
                className="mt-4 inline-block text-[#4f46e5] hover:underline"
              >
                Retour à la liste des événements
              </Link>
            </Card>
          </Container>
        </div>
      );
    }
    return (
      <div className="py-10">
        <Container>
          <Card>
            <h1 className="text-xl font-semibold text-white">
              Erreur de chargement
            </h1>
            <p className="mt-2 text-[#a1a1aa]">
              Impossible de charger l&apos;événement. Vérifiez que le backend est
              démarré.
            </p>
            <Link
              href="/events"
              className="mt-4 inline-block text-[#4f46e5] hover:underline"
            >
              Retour à la liste des événements
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

  const placesRestantes = event.capacity - event.confirmedReservations;

  return (
    <div className="py-10 md:py-14">
      <Container>
        <div className="mx-auto max-w-2xl">
          <Card>
            <h1 className="text-2xl font-bold text-white md:text-3xl">
              {event.title}
            </h1>
            {event.description && (
              <p className="mt-4 text-[#a1a1aa] leading-relaxed">
                {event.description}
              </p>
            )}
            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-[#71717a]">Date</dt>
                <dd className="mt-0.5 text-white">{formatDate(event.date)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[#71717a]">Lieu</dt>
                <dd className="mt-0.5 text-white">{event.location}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[#71717a]">Capacité</dt>
                <dd className="mt-0.5 text-white">{event.capacity} places</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[#71717a]">
                  Places restantes
                </dt>
                <dd className="mt-0.5 text-white">{placesRestantes}</dd>
              </div>
            </dl>
            <div className="mt-8">
              <ReserveButton eventId={event.id} />
            </div>
            <Link
              href="/events"
              className="mt-6 inline-block text-sm text-[#a1a1aa] hover:text-white hover:underline"
            >
              ← Retour à la liste des événements
            </Link>
          </Card>
        </div>
      </Container>
    </div>
  );
}
