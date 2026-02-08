type EmptyStateProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  children,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-lg border border-[#2d2d3a] bg-[#111118] p-8 text-center ${className}`}
    >
      <h3 className="text-lg font-medium text-white">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-[#a1a1aa]">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
