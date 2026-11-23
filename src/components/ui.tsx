// EL FASL — shared UI primitives (server-safe, no emojis).
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { CircleCheck, Info, LoaderCircle } from "lucide-react";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-electric text-white hover:bg-electric-dark shadow-sm shadow-electric/30 disabled:bg-electric/50",
  secondary:
    "bg-white text-navy border border-slate-200 hover:bg-slate-50 dark:bg-navy-light dark:text-white dark:border-slate-700 dark:hover:bg-navy",
  ghost: "text-navy hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-navy-light",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400",
  accent: "bg-accent text-white hover:bg-accent/90 shadow-sm shadow-accent/30",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-12 px-6 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 disabled:cursor-not-allowed active:scale-[0.98]",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-navy-light",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-base text-navy placeholder:text-slate-400 focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/20 dark:border-slate-700 dark:bg-navy dark:text-white",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-base text-navy focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/20 dark:border-slate-700 dark:bg-navy dark:text-white",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-navy placeholder:text-slate-400 focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/20 dark:border-slate-700 dark:bg-navy dark:text-white",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-navy dark:text-slate-200">
        {label}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

type BadgeVariant = "default" | "success" | "warning" | "info" | "accent";

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  accent: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
};

export function Badge({
  variant = "default",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        badgeVariants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Alert({
  variant = "info",
  className,
  children,
}: {
  variant?: "info" | "success" | "error" | "warning";
  className?: string;
  children: ReactNode;
}) {
  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200",
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
    error:
      "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200",
    warning:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
  } as const;
  const Icon = variant === "success" ? CircleCheck : Info;
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm font-medium",
        styles[variant],
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700", className)}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-gradient-to-l from-electric to-accent transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle className={cn("size-5 animate-spin text-electric", className)} />;
}
