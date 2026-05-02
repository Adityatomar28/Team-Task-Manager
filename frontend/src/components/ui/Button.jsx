import { cn } from "../../utils/cn"

const variants = {
  primary: "bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-white shadow-[0_10px_24px_rgba(99,102,241,0.25)] hover:shadow-[0_14px_30px_rgba(99,102,241,0.32)]",
  secondary: "bg-surface-muted text-text hover:bg-slate-200 dark:hover:bg-slate-800",
  ghost: "bg-transparent text-text hover:bg-surface-muted",
}

export function Button({ className, variant = "primary", disabled, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-all duration-200 ease-in-out",
        "hover:scale-[1.05] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100",
        variants[variant],
        className
      )}
      disabled={disabled}
      {...props}
    />
  )
}
