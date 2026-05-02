import { AnimatePresence, motion } from "framer-motion"
import { Bell, FolderKanban, KanbanSquare, LayoutDashboard, Search, Users, UserCircle2, X } from "lucide-react"
import { Avatar } from "../ui/Avatar"
import { cn } from "../../utils/cn"

const items = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "projects", label: "Projects", icon: FolderKanban },
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
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              active ? "bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-white shadow-lg shadow-indigo-500/20" : "text-text-muted hover:translate-x-1 hover:bg-surface-muted hover:text-text hover:shadow-md"
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

function SidebarShell({ activePage, onSelect, user }) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] font-bold text-white shadow-lg shadow-indigo-500/20">
            TS
          </div>
          <div>
            <p className="text-lg font-semibold">TeamSync</p>
            <p className="text-xs text-text-muted">Project OS</p>
          </div>
        </div>
      </div>
      <SidebarLinks activePage={activePage} onSelect={onSelect} />
      <div className="mt-8 rounded-2xl border border-indigo-100 bg-[linear-gradient(135deg,#eef2ff,#faf5ff)] p-4 dark:border-slate-800 dark:bg-[linear-gradient(135deg,#111827,#1e1b4b)]">
        <p className="text-sm font-semibold">Role-aware workspace</p>
        <p className="mt-1 text-xs leading-5 text-text-muted">Admins manage projects and teams. Members focus on assigned delivery.</p>
      </div>
      <div className="mt-auto flex items-center gap-3 rounded-2xl border bg-surface-muted p-3">
        <Avatar name={user?.fullName || user?.username || "TeamSync User"} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user?.fullName || user?.username || "TeamSync User"}</p>
          <p className="truncate text-xs text-text-muted">{user?.primaryEmailAddress?.emailAddress || "Workspace member"}</p>
        </div>
      </div>
    </div>
  )
}

export function AppHeader({ title, description, onMenuClick, action, userControl, darkMode, onDarkModeToggle }) {
  return (
    <header className="sticky top-0 z-20 -mx-4 mb-6 border-b border-border/70 bg-bg/85 px-4 py-4 backdrop-blur-xl md:-mx-8 md:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <button className="rounded-xl border bg-surface p-2 md:hidden" onClick={onMenuClick}>
            <MenuIcon />
          </button>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
            <p className="mt-1 text-sm text-text-muted md:text-base">{description}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex h-11 min-w-0 items-center gap-2 rounded-2xl border bg-surface px-3 shadow-sm md:w-80">
            <Search size={17} className="text-text-muted" />
            <input className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search projects, tasks, members..." />
          </div>
          <div className="flex items-center gap-2">
            {action}
            <button className="grid size-11 place-items-center rounded-2xl border bg-surface text-text-muted transition hover:scale-[1.05] hover:text-text">
              <Bell size={18} />
            </button>
            <button className="h-11 rounded-2xl border bg-surface px-3 text-xs font-semibold text-text-muted transition hover:scale-[1.05] hover:text-text" onClick={onDarkModeToggle}>
              {darkMode ? "Light" : "Dark"}
            </button>
            <div className="grid size-11 place-items-center rounded-2xl border bg-surface">
              {userControl}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function MenuIcon() {
  return <span className="block h-4 w-4 rounded bg-[linear-gradient(135deg,#6366f1,#8b5cf6)]" />
}

export function Sidebar({ activePage, onSelect, mobileOpen, onClose, user }) {
  return (
    <>
      <aside className="hidden w-72 flex-none border-r border-border bg-surface/90 p-5 backdrop-blur-xl md:block">
        <SidebarShell activePage={activePage} onSelect={onSelect} user={user} />
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
              <SidebarShell
                activePage={activePage}
                user={user}
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
