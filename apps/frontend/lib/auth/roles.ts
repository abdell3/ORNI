import type { User } from "@/lib/auth/auth.types";

export function isAdmin(user: User | null): boolean {
  return user?.role === "ADMIN";
}

export function isParticipant(user: User | null): boolean {
  return user?.role === "PARTICIPANT";
}
