import { fetchWithAuth } from "@/lib/auth/auth.service";
import { getApiBaseUrl } from "@/lib/api/client";
import type { Event } from "@/lib/types/event";
import { EVENTS_ENDPOINT } from "./endpoints/events";

function normalizeEvent(data: Record<string, unknown>): Event {
  return {
    id: String(data.id),
    title: String(data.title),
    description: String(data.description),
    date: String(data.date),
    location: String(data.location),
    capacity: Number(data.capacity),
    status: (data.status as Event["status"]) ?? "DRAFT",
    confirmedReservations: Number(data.confirmedReservations ?? 0),
  };
}

export interface CreateEventDto {
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  capacity?: number;
}

export async function createEvent(dto: CreateEventDto): Promise<Event> {
  const base = getApiBaseUrl();
  const res = await fetchWithAuth(`${base}${EVENTS_ENDPOINT}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
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
  return normalizeEvent(data);
}

export async function updateEvent(
  id: string,
  dto: UpdateEventDto
): Promise<Event> {
  const base = getApiBaseUrl();
  const res = await fetchWithAuth(`${base}${EVENTS_ENDPOINT}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
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
  return normalizeEvent(data);
}

export async function publishEvent(id: string): Promise<Event> {
  const base = getApiBaseUrl();
  const res = await fetchWithAuth(`${base}${EVENTS_ENDPOINT}/${id}/publish`, {
    method: "PATCH",
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
  return normalizeEvent(data);
}

export async function cancelEvent(id: string): Promise<Event> {
  const base = getApiBaseUrl();
  const res = await fetchWithAuth(`${base}${EVENTS_ENDPOINT}/${id}/cancel`, {
    method: "PATCH",
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
  return normalizeEvent(data);
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

function normalizeUser(data: Record<string, unknown>): UserProfile {
  return {
    id: String(data.id),
    email: String(data.email),
    role: String(data.role),
    firstName: String(data.firstName),
    lastName: String(data.lastName),
    createdAt: String(data.createdAt),
    updatedAt: String(data.updatedAt),
  };
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const base = getApiBaseUrl();
  const res = await fetchWithAuth(`${base}/users`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message =
      typeof (data as { message?: string }).message === "string"
        ? (data as { message: string }).message
        : `HTTP ${res.status}`;
    throw new Error(message);
  }
  const json = (await res.json()) as unknown[];
  return json.map((item) =>
    normalizeUser(item as Record<string, unknown>)
  );
}

export interface AdminReservation {
  id: string;
  eventId: string;
  status: string;
  createdAt: string;
  event: { id: string; title: string; date: string; location: string };
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

function normalizeAdminReservation(
  data: Record<string, unknown>
): AdminReservation {
  const event = data.event as Record<string, unknown> | undefined;
  const user = data.user as Record<string, unknown> | undefined;
  return {
    id: String(data.id),
    eventId: String(data.eventId),
    status: String(data.status),
    createdAt: String(data.createdAt),
    event: event
      ? {
          id: String(event.id),
          title: String(event.title),
          date: String(event.date),
          location: String(event.location),
        }
      : {
          id: String(data.eventId),
          title: "",
          date: "",
          location: "",
        },
    user: user
      ? {
          id: String(user.id),
          email: String(user.email),
          firstName: String(user.firstName),
          lastName: String(user.lastName),
        }
      : undefined,
  };
}

export async function getEventReservations(
  eventId: string
): Promise<AdminReservation[]> {
  const base = getApiBaseUrl();
  const res = await fetchWithAuth(
    `${base}${EVENTS_ENDPOINT}/${eventId}/reservations`
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message =
      typeof (data as { message?: string }).message === "string"
        ? (data as { message: string }).message
        : `HTTP ${res.status}`;
    throw new Error(message);
  }
  const json = (await res.json()) as unknown[];
  return json.map((item) =>
    normalizeAdminReservation(item as Record<string, unknown>)
  );
}
