import { RoleGuard } from "@/components/auth/RoleGuard";

const PARTICIPANT_ROLE = "PARTICIPANT";

export default function ParticipantLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RoleGuard allowedRoles={[PARTICIPANT_ROLE]}>{children}</RoleGuard>;
}
