"use client";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "genre" | "quality" | "visibility";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-bg-tertiary text-body text-xs",
  genre: "bg-indigo-500/20 text-indigo-300 text-xs border border-indigo-500/30",
  quality: "bg-emerald-500/20 text-emerald-300 text-xs",
  visibility: "bg-zinc-600/40 text-zinc-300 text-xs uppercase tracking-wide",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
