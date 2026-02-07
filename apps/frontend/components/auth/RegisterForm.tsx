"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { register as registerUser } from "@/lib/auth/auth.service";
import type { RegisterDto } from "@/lib/auth/auth.types";

export function RegisterForm() {
  const router = useRouter();
  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterDto>();

  async function onSubmit(data: RegisterDto) {
    try {
      await registerUser(data);
      router.push("/login");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de l'inscription";
      setError("root", { type: "manual", message });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="register-firstName"
          className="mb-1 block text-sm font-medium"
        >
          Prénom
        </label>
        <input
          id="register-firstName"
          type="text"
          autoComplete="given-name"
          className="w-full rounded border border-zinc-300 px-3 py-2"
          {...registerField("firstName", {
            required: "Le prénom est requis",
            minLength: { value: 1, message: "Le prénom est requis" },
          })}
        />
        {errors.firstName && (
          <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="register-lastName"
          className="mb-1 block text-sm font-medium"
        >
          Nom
        </label>
        <input
          id="register-lastName"
          type="text"
          autoComplete="family-name"
          className="w-full rounded border border-zinc-300 px-3 py-2"
          {...registerField("lastName", {
            required: "Le nom est requis",
            minLength: { value: 1, message: "Le nom est requis" },
          })}
        />
        {errors.lastName && (
          <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="register-email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="register-email"
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
          htmlFor="register-password"
          className="mb-1 block text-sm font-medium"
        >
          Mot de passe
        </label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          className="w-full rounded border border-zinc-300 px-3 py-2"
          {...registerField("password", {
            required: "Le mot de passe est requis",
            minLength: {
              value: 8,
              message: "Le mot de passe doit contenir au moins 8 caractères",
            },
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
        {isSubmitting ? "Inscription..." : "S'inscrire"}
      </button>
    </form>
  );
}
