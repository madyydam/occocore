import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "neutral"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "outline";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-colors";

  const variantStyles = {
    default:
      "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20",
    neutral:
      "bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20",
    success:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
    warning:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
    danger:
      "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20",
    info:
      "bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20",
    outline:
      "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300",
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    />
  );
}
