import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
};

const base =
  "inline-flex items-center justify-center font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:ring-offset-2 focus:ring-offset-[#0b0b0f] disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary:
    "bg-[#4f46e5] text-white hover:bg-[#4338ca] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.2)]",
  secondary:
    "bg-[#111118] text-white border border-[#2d2d3a] hover:bg-[#1a1a24]",
  ghost: "text-[#a1a1aa] hover:bg-[#111118] hover:text-white",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type={props.type ?? "button"}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
