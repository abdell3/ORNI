import Link from "next/link";
import { fetchEvents } from "@/lib/api/client";
import { Container } from "@/components/layout/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { EventCard } from "@/components/events/EventCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const events = await fetchEvents();
  const featuredEvents = events.slice(0, 6);

  return (
    <>
      <section className="border-b border-[#2d2d3a] py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              Réservez vos événements en quelques clics
            </h1>
            <p className="mt-6 text-lg text-[#a1a1aa]">
              Découvrez les prochains événements et réservez votre place
              facilement.
            </p>
            <Link
              href="/events"
              className="mt-8 inline-block rounded-lg bg-[#4f46e5] px-6 py-3 text-base font-medium text-white transition hover:bg-[#4338ca]"
            >
              Voir les événements
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <SectionTitle className="mb-8 text-center">
            Événements à venir
          </SectionTitle>
          {featuredEvents.length === 0 ? (
            <p className="text-center text-[#a1a1aa]">
              Aucun événement pour le moment.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((event) => (
                <li key={event.id}>
                  <EventCard event={event} />
                </li>
              ))}
            </ul>
          )}
          {events.length > 0 && (
            <div className="mt-10 text-center">
              <Link
                href="/events"
                className="text-[#4f46e5] hover:underline"
              >
                Voir tous les événements →
              </Link>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
