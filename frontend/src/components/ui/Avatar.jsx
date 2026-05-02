export function Avatar({ name }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#c7d2fe,#ddd6fe)] text-xs font-semibold text-indigo-800 ring-2 ring-white dark:ring-slate-900">
      {initials}
    </div>
  )
}
