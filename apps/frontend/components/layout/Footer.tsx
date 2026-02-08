export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#2d2d3a] bg-[#0b0b0f] py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-[#71717a]">
          © {new Date().getFullYear()} ORNI — Réservation d&apos;événements
        </p>
      </div>
    </footer>
  );
}
