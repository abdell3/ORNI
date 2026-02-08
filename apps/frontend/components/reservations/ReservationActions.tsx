"use client";

import { useState } from "react";
import { cancelReservation } from "@/lib/api/reservations";
import { downloadTicket } from "@/lib/api/ticket";
import type { Reservation } from "@/lib/types/reservation";
import { Button } from "@/components/ui/Button";

type Props = {
  reservation: Reservation;
  onUpdated: () => void;
};

export function ReservationActions({ reservation, onUpdated }: Props) {
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPending = reservation.status === "PENDING";
  const isConfirmed = reservation.status === "CONFIRMED";
  const hasActions = isPending || isConfirmed;

  async function handleCancel() {
    setErrorMessage(null);
    setLoadingCancel(true);
    try {
      await cancelReservation(reservation.id);
      onUpdated();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Erreur lors de l'annulation."
      );
    } finally {
      setLoadingCancel(false);
    }
  }

  async function handleDownload() {
    setErrorMessage(null);
    setLoadingDownload(true);
    try {
      await downloadTicket(reservation.id);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Erreur lors du téléchargement."
      );
    } finally {
      setLoadingDownload(false);
    }
  }

  if (!hasActions) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleCancel}
        disabled={loadingCancel}
        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
      >
        {loadingCancel ? "Annulation..." : "Annuler"}
      </Button>
      {isConfirmed && (
        <Button
          type="button"
          size="sm"
          onClick={handleDownload}
          disabled={loadingDownload}
        >
          {loadingDownload ? "Téléchargement..." : "Télécharger ticket"}
        </Button>
      )}
      {errorMessage && (
        <p className="w-full text-sm text-red-400">{errorMessage}</p>
      )}
    </div>
  );
}
