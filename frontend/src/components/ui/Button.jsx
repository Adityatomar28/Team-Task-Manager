import { cn } from "../../utils/cn"

const variants = {
  primary: "bg-primary text-white hover:bg-primary-strong",
  secondary: "bg-surface-muted text-text hover:bg-slate-200",
  ghost: "bg-transparent text-text hover:bg-surface-muted",
}

export function Button({ className, variant = "primary", disabled, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium transition-all duration-200 ease-in-out",
        "hover:scale-[1.01] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      disabled={disabled}
      {...props}
    />
  )
}
