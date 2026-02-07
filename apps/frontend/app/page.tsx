import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">ORNI — Page d&apos;accueil</h1>
      <p className="text-zinc-600">Bienvenue sur l&apos;application Next.js.</p>
      <nav className="flex gap-4">
        <Link href="/events" className="text-blue-600 underline">
          Événements
        </Link>
        <Link href="/login" className="text-blue-600 underline">
          Connexion
        </Link>
        <Link href="/register" className="text-blue-600 underline">
          Inscription
        </Link>
      </nav>
    </div>
  );
}
