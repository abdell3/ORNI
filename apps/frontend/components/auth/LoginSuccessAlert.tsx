"use client";

import { useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/Alert";

export function LoginSuccessAlert() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  if (registered !== "1") return null;

  return (
    <Alert
      type="success"
      message="Inscription réussie. Connectez-vous."
      className="mt-4"
    />
  );
}
