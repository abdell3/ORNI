import { Loader } from "@/components/ui/Loader";
import { Container } from "@/components/layout/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";

export default function EventsLoading() {
  return (
    <div className="py-10 md:py-14">
      <Container>
        <SectionTitle as="h1" className="mb-8">
          Tous les événements
        </SectionTitle>
        <Loader />
      </Container>
    </div>
  );
}
