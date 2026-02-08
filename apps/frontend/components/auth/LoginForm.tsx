"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/auth/auth.context";
import type { LoginDto } from "@/lib/auth/auth.types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

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
      const user = await login(data);
      const from = searchParams.get("from");
      const redirect =
        from ?? (user.role === "ADMIN" ? "/admin" : "/events");
      router.push(redirect);
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
      {errors.root?.message && (
        <Alert type="error" message={errors.root.message} />
      )}
      <Button
        type="submit"
        loading={isSubmitting}
        size="lg"
        className="mt-2"
      >
        Se connecter
      </Button>
    </form>
  );
}
