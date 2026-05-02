import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Menu } from "lucide-react"
import { Show, SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/react"
import { Sidebar } from "./components/layout/Sidebar"
import { Button } from "./components/ui/Button"
import { DashboardPage } from "./pages/DashboardPage"
import { TeamsPage } from "./pages/TeamsPage"
import { MembersPage } from "./pages/MembersPage"
import { TasksPage } from "./pages/TasksPage"
import { useTeamSyncData } from "./hooks/useTeamSyncData"

function SignedInApp() {
  const { getToken, isSignedIn } = useAuth()
  const [activePage, setActivePage] = useState("dashboard")
  const [mobileOpen, setMobileOpen] = useState(false)
  const data = useTeamSyncData(getToken, isSignedIn)

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar activePage={activePage} onSelect={setActivePage} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="rounded-lg border bg-white p-2 md:hidden" onClick={() => setMobileOpen(true)}>
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-semibold">Team Management</h1>
              <p className="text-sm text-text-muted">Operate teams, members, and tasks with precision.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={data.addSampleTask} disabled={!data.activeProjectId}>
              Add Task
            </Button>
            <UserButton />
          </div>
        </header>

        {data.error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {data.error} <button className="ml-2 underline" onClick={data.refresh}>Retry</button>
          </div>
        ) : null}

        <div className="mb-6 flex flex-wrap gap-2">
          {data.projects.map((project) => (
            <button
              key={project.id}
              className={`rounded-full px-3 py-1.5 text-xs transition ${
                data.activeProjectId === project.id ? "bg-primary text-white" : "bg-white text-text-muted hover:bg-slate-100"
              }`}
              onClick={() => data.selectProject(project.id)}
            >
              {project.name}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            {activePage === "dashboard" ? <DashboardPage dashboard={data.dashboard} loading={data.loading} /> : null}
            {activePage === "teams" ? <TeamsPage teams={data.projects} creating={data.creating} onCreateTeam={data.createTeam} /> : null}
            {activePage === "members" ? <MembersPage /> : null}
            {activePage === "tasks" ? <TasksPage tasks={data.tasks} onMoveTask={data.moveTask} /> : null}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

function App() {
  return (
    <>
      <Show when="signed-out">
        <div className="flex min-h-screen items-center justify-center bg-bg p-4">
          <div className="w-full max-w-md rounded-2xl border bg-surface p-8 shadow-[var(--shadow-card)]">
            <h1 className="text-2xl font-semibold">Welcome to TeamSync</h1>
            <p className="mt-2 text-sm text-text-muted">Sign in to manage your teams and task delivery.</p>
            <div className="mt-6 flex gap-3">
              <SignInButton>
                <button className="h-10 rounded-xl bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary-strong">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="h-10 rounded-xl bg-slate-100 px-4 text-sm font-medium transition hover:bg-slate-200">
                  Sign up
                </button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </Show>
      <Show when="signed-in">
        <SignedInApp />
      </Show>
    </>
  )
}

export default App
