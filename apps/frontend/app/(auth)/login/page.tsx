import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/Card";
import { LoginSuccessAlert } from "@/components/auth/LoginSuccessAlert";

export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-md px-4">
        <Card className="shadow-xl">
          <h1 className="text-2xl font-bold text-white">Connexion</h1>
          <Suspense fallback={<p className="mt-4 text-[#a1a1aa]">Chargement...</p>}>
            <LoginSuccessAlert />
            <LoginForm />
          </Suspense>
          <p className="mt-6 border-t border-[#2d2d3a] pt-6 text-sm text-[#a1a1aa]">
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-[#4f46e5] hover:underline">
              S&apos;inscrire
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
