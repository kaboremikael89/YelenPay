import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "dark" | "outline" | "ghost" | "danger";
type Size = "default" | "sm" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-orange-grad text-primary-foreground hover:brightness-105 shadow-lg shadow-primary/25",
  accent: "bg-accent text-accent-foreground hover:brightness-95 shadow-sm",
  dark: "bg-dark text-dark-foreground hover:brightness-110 shadow-md",
  outline:
    "border border-primary/30 text-primary bg-transparent hover:bg-primary/5",
  ghost: "bg-transparent text-foreground hover:bg-black/5",
  danger: "bg-danger text-white hover:brightness-95 shadow-sm",
};

const sizes: Record<Size, string> = {
  default: "h-12 px-5 text-sm",
  sm: "h-9 px-3 text-sm",
  lg: "h-14 px-6 text-base",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
