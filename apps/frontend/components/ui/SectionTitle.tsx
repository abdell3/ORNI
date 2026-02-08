type SectionTitleProps = {
  children: React.ReactNode;
  as?: "h1" | "h2";
  className?: string;
};

export function SectionTitle({
  children,
  as: Tag = "h2",
  className = "",
}: SectionTitleProps) {
  const baseClass =
    Tag === "h1"
      ? "text-3xl font-bold tracking-tight text-white md:text-4xl"
      : "text-2xl font-semibold text-white";
  return <Tag className={`${baseClass} ${className}`}>{children}</Tag>;
}
