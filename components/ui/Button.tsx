import type { ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "outline";

interface ButtonProps extends ComponentPropsWithoutRef<"a"> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-fill-primary border border-transparent bg-amber text-canvas",
  outline: "btn-fill-outline border border-grid bg-transparent text-paper",
};

/**
 * Shared CTA button — Cataly-style fill-from-bottom hover.
 */
export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <a
      className={`btn-fill inline-flex items-center justify-center overflow-hidden rounded-none px-6 py-3 font-display text-sm font-bold ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <span className="btn-fill-label relative z-[1]">{children}</span>
    </a>
  );
}
