"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface EmptyStateProps {
  /** Large heading text */
  heading: string;
  /** Smaller subtext below heading */
  subtext?: string;
  /** Optional CTA button */
  action?: ReactNode;
  /** Optional icon (e.g. a Lucide icon component) */
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({ heading, subtext, action, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16 px-8 text-center",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {icon && (
        <div className="text-muted opacity-50">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-heading">{heading}</h2>
        {subtext && (
          <p className="text-sm text-muted max-w-xs mx-auto">{subtext}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
