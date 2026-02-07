"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { login } from "@/lib/auth/auth.service";
import type { LoginDto } from "@/lib/auth/auth.types";

export function LoginForm() {
  const router = useRouter();
  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginDto>();

  async function onSubmit(data: LoginDto) {
    try {
      await login(data);
      router.push("/events");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur de connexion";
      setError("root", { type: "manual", message });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <label htmlFor="login-email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          className="w-full rounded border border-zinc-300 px-3 py-2"
          {...registerField("email", {
            required: "L'email est requis",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Email invalide",
            },
          })}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="login-password"
          className="mb-1 block text-sm font-medium"
        >
          Mot de passe
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded border border-zinc-300 px-3 py-2"
          {...registerField("password", {
            required: "Le mot de passe est requis",
          })}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>
      {errors.root && (
        <p className="text-sm text-red-600">{errors.root.message}</p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
