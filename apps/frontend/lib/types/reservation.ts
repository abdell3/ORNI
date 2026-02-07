export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REFUSED"
  | "CANCELED";

export interface ReservationEventSummary {
  id: string;
  title: string;
  date: string;
  location: string;
}

export interface Reservation {
  id: string;
  eventId: string;
  status: ReservationStatus;
  createdAt: string;
  event: ReservationEventSummary;
}
