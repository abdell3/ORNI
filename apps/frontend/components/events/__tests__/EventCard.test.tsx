import { render, screen } from "@testing-library/react";
import { EventCard } from "../EventCard";
import type { Event } from "@/lib/types/event";

jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

const mockEvent: Event = {
  id: "evt-1",
  title: "Concert Jazz",
  description: "Soirée jazz",
  date: "2025-06-15T19:00:00.000Z",
  location: "Paris",
  capacity: 100,
  status: "PUBLISHED",
  confirmedReservations: 30,
};

describe("EventCard", () => {
  it("affiche le titre", () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText("Concert Jazz")).toBeInTheDocument();
  });

  it("affiche la date formatée", () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText(/15 juin 2025/i)).toBeInTheDocument();
  });

  it("contient un lien vers /events/[id]", () => {
    render(<EventCard event={mockEvent} />);
    const link = screen.getByRole("link", { name: /voir détails/i });
    expect(link).toHaveAttribute("href", "/events/evt-1");
  });
});
