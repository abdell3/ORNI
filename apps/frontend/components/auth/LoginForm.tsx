"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/auth/auth.context";
import type { LoginDto } from "@/lib/auth/auth.types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginDto>();

  async function onSubmit(data: LoginDto) {
    try {
      await login(data);
      const from = searchParams.get("from");
      router.push(from ?? "/events");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur de connexion";
      setError("root", { type: "manual", message });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
      <Input
        id="login-email"
        type="email"
        autoComplete="email"
        label="Email"
        error={errors.email?.message}
        {...registerField("email", {
          required: "L'email est requis",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Email invalide",
          },
        })}
      />
      <Input
        id="login-password"
        type="password"
        autoComplete="current-password"
        label="Mot de passe"
        error={errors.password?.message}
        {...registerField("password", {
          required: "Le mot de passe est requis",
        })}
      />
      {errors.root && (
        <p className="text-sm text-red-400" role="alert">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting} size="lg" className="mt-2">
        {isSubmitting ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}
