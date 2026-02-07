import { fetchWithAuth } from "@/lib/auth/auth.service";
import type { Reservation, ReservationEventSummary } from "@/lib/types/reservation";
import { getApiBaseUrl } from "@/lib/api/client";

function normalizeEventSummary(data: Record<string, unknown>): ReservationEventSummary {
  return {
    id: String(data.id),
    title: String(data.title),
    date: String(data.date),
    location: String(data.location),
  };
}

function normalizeReservation(data: Record<string, unknown>): Reservation {
  const event = data.event as Record<string, unknown> | undefined;
  return {
    id: String(data.id),
    eventId: String(data.eventId),
    status: data.status as Reservation["status"],
    createdAt: String(data.createdAt),
    event: event ? normalizeEventSummary(event) : {
      id: String(data.eventId),
      title: "",
      date: "",
      location: "",
    },
  };
}

export async function createReservation(eventId: string): Promise<Reservation> {
  const base = getApiBaseUrl();
  const res = await fetchWithAuth(`${base}/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message =
      typeof (data as { message?: string }).message === "string"
        ? (data as { message: string }).message
        : `HTTP ${res.status}`;
    throw new Error(message);
  }
  const data = (await res.json()) as Record<string, unknown>;
  return normalizeReservation(data);
}

export async function getMyReservations(): Promise<Reservation[]> {
  const base = getApiBaseUrl();
  const res = await fetchWithAuth(`${base}/users/me/reservations`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message =
      typeof (data as { message?: string }).message === "string"
        ? (data as { message: string }).message
        : `HTTP ${res.status}`;
    throw new Error(message);
  }
  const json = (await res.json()) as unknown[];
  return json.map((item) => normalizeReservation(item as Record<string, unknown>));
}
