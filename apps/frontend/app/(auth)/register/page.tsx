import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card } from "@/components/ui/Card";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-md px-4">
        <Card className="shadow-xl">
          <h1 className="text-2xl font-bold text-white">Inscription</h1>
          <RegisterForm />
          <p className="mt-6 border-t border-[#2d2d3a] pt-6 text-sm text-[#a1a1aa]">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-[#4f46e5] hover:underline">
              Se connecter
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
