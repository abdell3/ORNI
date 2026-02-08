import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReserveButton } from "@/components/events/ReserveButton";
import { createReservation } from "@/lib/api/reservations";
import { useAuth } from "@/lib/auth/auth.context";

jest.mock("@/lib/api/reservations");
jest.mock("@/lib/auth/auth.context");

const mockCreateReservation = createReservation as jest.MockedFunction<
  typeof createReservation
>;

describe("ReservationFlow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: "u1", email: "u@test.com", role: "PARTICIPANT" },
      loading: false,
    });
    mockCreateReservation.mockResolvedValue({
      id: "res-1",
      eventId: "evt-1",
      status: "CONFIRMED",
      createdAt: "2025-01-01T00:00:00Z",
      event: {
        id: "evt-1",
        title: "Event",
        date: "2025-06-01",
        location: "Paris",
      },
    });
  });

  it("affiche le bouton Réserver, appelle createReservation au clic et affiche le message de succès", async () => {
    render(<ReserveButton eventId="evt-1" />);

    const button = screen.getByRole("button", { name: /réserver/i });
    expect(button).toBeInTheDocument();

    await userEvent.click(button);

    expect(mockCreateReservation).toHaveBeenCalledTimes(1);
    expect(mockCreateReservation).toHaveBeenCalledWith("evt-1");

    expect(await screen.findByText("Réservation confirmée.")).toBeInTheDocument();
  });
});
