type LoaderProps = {
  className?: string;
};

export function Loader({ className = "" }: LoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}
      aria-busy="true"
      aria-label="Chargement"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-[#2d2d3a] border-t-[#4f46e5]"
        aria-hidden
      />
      <p className="text-sm text-[#a1a1aa]">Chargement…</p>
    </div>
  );
}
