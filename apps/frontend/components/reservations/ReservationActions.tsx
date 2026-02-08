"use client";

import { useState } from "react";
import { cancelReservation } from "@/lib/api/reservations";
import { downloadTicket } from "@/lib/api/ticket";
import type { Reservation } from "@/lib/types/reservation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

type Props = {
  reservation: Reservation;
  onUpdated: () => void;
};

export function ReservationActions({ reservation, onUpdated }: Props) {
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isPending = reservation.status === "PENDING";
  const isConfirmed = reservation.status === "CONFIRMED";
  const hasActions = isPending || isConfirmed;

  async function handleCancel() {
    if (!confirm("Confirmer l'annulation ?")) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoadingCancel(true);
    try {
      await cancelReservation(reservation.id);
      setSuccessMessage("Réservation annulée.");
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
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleCancel}
          loading={loadingCancel}
          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
        >
          Annuler
        </Button>
        {isConfirmed && (
          <Button
            type="button"
            size="sm"
            onClick={handleDownload}
            loading={loadingDownload}
          >
            Télécharger ticket
          </Button>
        )}
      </div>
      {successMessage && (
        <Alert type="success" message={successMessage} />
      )}
      {errorMessage && <Alert type="error" message={errorMessage} />}
    </div>
  );
}
