"use client";

import { useState } from "react";
import { cancelReservation } from "@/lib/api/reservations";
import { downloadTicket } from "@/lib/api/ticket";
import type { Reservation } from "@/lib/types/reservation";

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
    <div className="mt-2 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleCancel}
        disabled={loadingCancel}
        className="rounded border border-red-600 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {loadingCancel ? "Annulation..." : "Annuler"}
      </button>
      {isConfirmed && (
        <button
          type="button"
          onClick={handleDownload}
          disabled={loadingDownload}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loadingDownload ? "Téléchargement..." : "Télécharger ticket"}
        </button>
      )}
      {errorMessage && (
        <p className="w-full text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}
