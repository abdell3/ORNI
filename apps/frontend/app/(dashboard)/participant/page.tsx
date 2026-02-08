"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/auth.context";
import { Container } from "@/components/layout/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

function roleLabel(role: string): string {
  return role === "ADMIN" ? "Administrateur" : "Participant";
}

export default function ParticipantDashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="py-10 md:py-14">
      <Container>
        <SectionTitle as="h1" className="mb-8">
          Mon profil
        </SectionTitle>
        <Card className="max-w-xl">
          <dl className="grid gap-4 sm:grid-cols-1">
            <div>
              <dt className="text-sm font-medium text-[#71717a]">Prénom</dt>
              <dd className="mt-1 text-white">{user.firstName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-[#71717a]">Nom</dt>
              <dd className="mt-1 text-white">{user.lastName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-[#71717a]">Email</dt>
              <dd className="mt-1 text-white">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-[#71717a]">Rôle</dt>
              <dd className="mt-1 text-white">{roleLabel(user.role)}</dd>
            </div>
          </dl>
          <div className="mt-6">
            <Link href="/participant/reservations">
              <Button variant="secondary" size="md">
                Voir mes réservations
              </Button>
            </Link>
          </div>
        </Card>
      </Container>
    </div>
  );
}
