import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Show, UserButton, useAuth, useUser } from "@clerk/react"
import { AppHeader, Sidebar } from "./components/layout/Sidebar"
import { Chatbot } from "./components/Chatbot"
import { Button } from "./components/ui/Button"
import { LandingPage } from "./pages/LandingPage"
import { DashboardPage } from "./pages/DashboardPage"
import { ProjectsPage } from "./pages/ProjectsPage"
import { TeamsPage } from "./pages/TeamsPage"
import { MembersPage } from "./pages/MembersPage"
import { TasksPage } from "./pages/TasksPage"
import { useTeamSyncData } from "./hooks/useTeamSyncData"

function SignedInApp() {
  const { getToken, isSignedIn } = useAuth()
  const { user } = useUser()
  const [activePage, setActivePage] = useState("dashboard")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const data = useTeamSyncData(getToken, isSignedIn, user)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
  }, [darkMode])

  const pageMeta = useMemo(() => ({
    dashboard: {
      title: "Dashboard",
      description: "Track progress, overdue work, activity, and delivery health.",
    },
    projects: {
      title: "Projects",
      description: "Review active project workspaces and delivery scope.",
    },
    teams: {
      title: "Teams",
      description: "Create teams, review ownership, and manage project scope.",
    },
    members: {
      title: "Members",
      description: "Invite teammates and control project roles.",
    },
    tasks: {
      title: "Tasks",
      description: "Plan, assign, move, and complete work across your team.",
    },
  }), [])
  const currentMeta = pageMeta[activePage] || pageMeta.dashboard
  const headerAction = activePage === "tasks" ? (
    <Button onClick={() => data.setTaskComposerOpen(true)} disabled={!data.activeProjectId}>
      <Plus size={16} />
      New Task
    </Button>
  ) : null

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_30%),linear-gradient(180deg,var(--color-bg),var(--color-bg))]">
      <Sidebar activePage={activePage} onSelect={setActivePage} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} user={user} />

      <main className="min-w-0 flex-1 p-4 pt-0 md:p-8 md:pt-0">
        <AppHeader
          title={currentMeta.title}
          description={currentMeta.description}
          action={headerAction}
          userControl={<UserButton />}
          onMenuClick={() => setMobileOpen(true)}
          darkMode={darkMode}
          onDarkModeToggle={() => setDarkMode((current) => !current)}
        />

        {data.error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {data.error} <button className="ml-2 underline" onClick={data.refresh}>Retry</button>
          </div>
        ) : null}

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {data.projects.map((project) => (
            <button
              key={project.id}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                data.activeProjectId === project.id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface text-text-muted shadow-sm hover:-translate-y-0.5 hover:bg-surface-muted hover:text-text hover:shadow-lg dark:bg-surface"
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            {activePage === "dashboard" ? <DashboardPage dashboard={data.dashboard} loading={data.loading} tasks={data.tasks} teams={data.projects} /> : null}
            {activePage === "projects" ? (
              <ProjectsPage
                projects={data.projects}
                activeProjectId={data.activeProjectId}
                creating={data.creating}
                onCreateProject={data.createTeam}
                onSelectProject={data.selectProject}
                onDeleteProject={data.deleteTeam}
              />
            ) : null}
            {activePage === "teams" ? (
              <TeamsPage
                teams={data.projects}
                activeProjectId={data.activeProjectId}
                creating={data.creating}
                onCreateTeam={data.createTeam}
                onSelectTeam={data.selectProject}
                onDeleteTeam={data.deleteTeam}
              />
            ) : null}
            {activePage === "members" ? <MembersPage rows={data.members} onAddMember={data.addMember} onDeleteMember={data.deleteMember} /> : null}
            {activePage === "tasks" ? (
              <TasksPage
                tasks={data.tasks}
                members={data.members}
                activeProject={data.activeProject}
                composerOpen={data.taskComposerOpen}
                onComposerOpenChange={data.setTaskComposerOpen}
                onCreateTask={data.createTask}
                onUpdateTask={data.updateTaskDetails}
                onMoveTask={data.moveTask}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </main>

      <Chatbot getAuth={data.getAuth} activeProjectId={data.activeProjectId} />
    </div>
  )
}

function App() {
  return (
    <>
      <Show when="signed-out">
        <LandingPage />
      </Show>
      <Show when="signed-in">
        <SignedInApp />
      </Show>
    </>
  )
}

export default App
