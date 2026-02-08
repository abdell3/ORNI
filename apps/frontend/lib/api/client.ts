import type { Event } from "@/lib/types/event";
import { EVENTS_ENDPOINT } from "./endpoints/events";

export function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return process.env.API_INTERNAL_URL ?? "";
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "";
}

function getBaseUrl(): string {
  return getApiBaseUrl();
}

function normalizeEvent(data: Record<string, unknown>): Event {
  return {
    id: String(data.id),
    title: String(data.title),
    description: String(data.description),
    date: String(data.date),
    location: String(data.location),
    capacity: Number(data.capacity),
    status: data.status as Event["status"],
    confirmedReservations: Number(data.confirmedReservations ?? 0),
  };
}

export async function fetchEvents(): Promise<Event[]> {
  const base = getBaseUrl();
  const res = await fetch(`${base}${EVENTS_ENDPOINT}`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const json = (await res.json()) as unknown[];
  return json.map((item) => normalizeEvent(item as Record<string, unknown>));
}

export async function fetchEventById(id: string): Promise<Event> {
  const base = getBaseUrl();
  const res = await fetch(`${base}${EVENTS_ENDPOINT}/${id}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("NOT_FOUND");
    }
    throw new Error(`HTTP ${res.status}`);
  }
  const data = (await res.json()) as Record<string, unknown>;
  return normalizeEvent(data);
}
