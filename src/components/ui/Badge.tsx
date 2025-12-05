import type { HTMLAttributes, ReactNode } from "react";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Badge({ className = "", children, ...props }: BadgeProps) {
  return (
    <div
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
