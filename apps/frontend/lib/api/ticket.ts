import { fetchWithAuth } from "@/lib/auth/auth.service";
import { getApiBaseUrl } from "@/lib/api/client";

export async function downloadTicket(reservationId: string): Promise<void> {
  const base = getApiBaseUrl();
  const res = await fetchWithAuth(
    `${base}/reservations/${reservationId}/ticket`
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = `HTTP ${res.status}`;
    try {
      const data = text ? (JSON.parse(text) as { message?: string }) : null;
      if (data?.message) message = data.message;
    } catch {
      if (text.length > 0) message = text;
    }
    throw new Error(message);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ticket-${reservationId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
