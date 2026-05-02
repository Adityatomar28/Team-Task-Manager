import { AnimatePresence, motion } from "framer-motion"
import { LayoutDashboard, Users, UserCircle2, KanbanSquare, X } from "lucide-react"
import { cn } from "../../utils/cn"

const items = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "teams", label: "Teams", icon: Users },
  { id: "members", label: "Members", icon: UserCircle2 },
  { id: "tasks", label: "Tasks", icon: KanbanSquare },
]

function SidebarLinks({ activePage, onSelect }) {
  return (
    <nav className="space-y-2">
      {items.map((item) => {
        const Icon = item.icon
        const active = activePage === item.id
        return (
          <button
            key={item.id}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200",
              active ? "bg-indigo-50 text-primary" : "text-text-muted hover:bg-slate-100 hover:text-text"
            )}
            onClick={() => onSelect(item.id)}
          >
            <Icon size={16} />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}

export function Sidebar({ activePage, onSelect, mobileOpen, onClose }) {
  return (
    <>
      <aside className="hidden w-64 flex-none border-r border-border bg-surface p-4 md:block">
        <p className="mb-6 text-xs font-semibold uppercase tracking-wider text-text-muted">TeamSync</p>
        <SidebarLinks activePage={activePage} onSelect={onSelect} />
      </aside>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div className="fixed inset-0 z-40 bg-slate-950/30 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
            <motion.aside
              className="h-full w-72 bg-surface p-4"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">TeamSync</p>
                <button onClick={onClose}>
                  <X size={18} />
                </button>
              </div>
              <SidebarLinks
                activePage={activePage}
                onSelect={(page) => {
                  onSelect(page)
                  onClose()
                }}
              />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
