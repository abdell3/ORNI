import { Loader } from "@/components/ui/Loader";
import { Container } from "@/components/layout/Container";

export default function EventDetailLoading() {
  return (
    <div className="py-10 md:py-14">
      <Container>
        <div className="mx-auto max-w-2xl">
          <Loader />
        </div>
      </Container>
    </div>
  );
}
