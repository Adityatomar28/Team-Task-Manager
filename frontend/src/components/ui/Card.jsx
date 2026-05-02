import { cn } from "../../utils/cn"

export function Card({ className, children }) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] transition-all duration-200 ease-in-out hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[var(--shadow-card-hover)] dark:bg-surface dark:hover:border-indigo-500/40",
        className
      )}
    >
      {children}
    </section>
  )
}
