import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-semibold">Connexion</h1>
      <LoginForm />
      <p className="mt-4 text-sm text-zinc-600">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-blue-600 underline">
          S&apos;inscrire
        </Link>
      </p>
    </main>
  );
}
