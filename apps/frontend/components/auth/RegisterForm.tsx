"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { register as registerUser } from "@/lib/auth/auth.service";
import type { RegisterDto } from "@/lib/auth/auth.types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
      <Input
        id="register-firstName"
        type="text"
        autoComplete="given-name"
        label="Prénom"
        error={errors.firstName?.message}
        {...registerField("firstName", {
          required: "Le prénom est requis",
          minLength: { value: 1, message: "Le prénom est requis" },
        })}
      />
      <Input
        id="register-lastName"
        type="text"
        autoComplete="family-name"
        label="Nom"
        error={errors.lastName?.message}
        {...registerField("lastName", {
          required: "Le nom est requis",
          minLength: { value: 1, message: "Le nom est requis" },
        })}
      />
      <Input
        id="register-email"
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
        id="register-password"
        type="password"
        autoComplete="new-password"
        label="Mot de passe"
        error={errors.password?.message}
        {...registerField("password", {
          required: "Le mot de passe est requis",
          minLength: {
            value: 8,
            message: "Le mot de passe doit contenir au moins 8 caractères",
          },
        })}
      />
      {errors.root && (
        <p className="text-sm text-red-400" role="alert">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting} size="lg" className="mt-2">
        {isSubmitting ? "Inscription..." : "S'inscrire"}
      </Button>
    </form>
  );
}
