import { cn } from "../../utils/cn"

const toneMap = {
  ADMIN: "bg-indigo-100 text-indigo-700",
  MANAGER: "bg-blue-100 text-blue-700",
  MEMBER: "bg-slate-100 text-slate-700",
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  DONE: "bg-emerald-100 text-emerald-700",
  HIGH: "bg-rose-100 text-rose-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-emerald-100 text-emerald-700",
}

export function Badge({ value, className }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", toneMap[value] || "bg-slate-100 text-slate-700", className)}>
      {value}
    </span>
  )
}
