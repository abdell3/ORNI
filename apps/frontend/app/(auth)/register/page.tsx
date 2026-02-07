import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-semibold">Inscription</h1>
      <RegisterForm />
      <p className="mt-4 text-sm text-zinc-600">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-blue-600 underline">
          Se connecter
        </Link>
      </p>
    </main>
  );
}
