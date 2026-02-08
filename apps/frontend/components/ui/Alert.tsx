type AlertProps = {
  type: "success" | "error" | "info";
  message: string;
  className?: string;
};

const styles = {
  success:
    "rounded-lg border border-emerald-500/30 bg-emerald-950/80 text-emerald-200",
  error:
    "rounded-lg border border-red-500/30 bg-red-950/80 text-red-200",
  info:
    "rounded-lg border border-[#2d2d3a] bg-[#111118] text-[#a1a1aa]",
};

export function Alert({ type, message, className = "" }: AlertProps) {
  return (
    <div
      role="alert"
      className={`p-3 text-sm ${styles[type]} ${className}`}
    >
      {message}
    </div>
  );
}
