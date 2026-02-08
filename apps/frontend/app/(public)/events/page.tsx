import { fetchEvents } from "@/lib/api/client";
import { Container } from "@/components/layout/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { EventCard } from "@/components/events/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  let events: Awaited<ReturnType<typeof fetchEvents>> = [];
  try {
    events = await fetchEvents();
  } catch {
    events = [];
  }

  return (
    <div className="py-10 md:py-14">
      <Container>
        <SectionTitle as="h1" className="mb-8">
          Tous les événements
        </SectionTitle>
        {events.length === 0 ? (
          <EmptyState
            title="Aucun événement"
            description="Aucun événement pour le moment."
          />
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </div>
  );
}
