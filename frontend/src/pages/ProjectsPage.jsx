import { useState } from "react"
import { ArrowRight, CalendarDays, CheckCircle2, FolderKanban, Plus, Target, Trash2, UsersRound } from "lucide-react"
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Modal } from "../components/ui/Modal"
import { cn } from "../utils/cn"

function ProjectMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border bg-surface p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]">
      <Icon size={18} className="text-primary" />
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  )
}

function ProjectForm({ creating, onCreateProject, onClose }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) {
      setError("Project name is required")
      return
    }

    try {
      await onCreateProject({ name, description })
      setName("")
      setDescription("")
      onClose()
    } catch (submitError) {
      setError(submitError.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Project name</label>
        <input
          className="h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-indigo-100 dark:bg-slate-950 dark:text-white"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. SaaS redesign"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Goal</label>
        <textarea
          className="min-h-28 w-full rounded-xl border bg-white p-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-indigo-100 dark:bg-slate-950 dark:text-white"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What outcome should this project deliver?"
        />
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={creating}>{creating ? "Creating..." : "Create Project"}</Button>
      </div>
    </form>
  )
}

export function ProjectsPage({ projects = [], activeProjectId, creating, onCreateProject, onSelectProject, onDeleteProject }) {
  const [open, setOpen] = useState(false)
  const totalTasks = projects.reduce((sum, project) => sum + (project._count?.tasks || 0), 0)
  const totalMembers = projects.reduce((sum, project) => sum + (project._count?.members || 0), 0)

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-[linear-gradient(135deg,#eef2ff_0%,#faf5ff_60%,#ffffff_100%)] p-6 shadow-[var(--shadow-card)] dark:bg-[linear-gradient(135deg,#111827_0%,#1e1b4b_100%)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Project portfolio</p>
            <h2 className="mt-2 text-3xl font-semibold">Plan outcomes, scope, and delivery</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-muted">
              Projects are high-level workspaces for goals, timelines, tasks, and delivery health. Use Teams to manage people and roles.
            </p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} />
            Create Project
          </Button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <ProjectMetric icon={FolderKanban} label="Projects" value={projects.length} />
        <ProjectMetric icon={Target} label="Tasks in scope" value={totalTasks} />
        <ProjectMetric icon={UsersRound} label="Collaborators" value={totalMembers} />
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-indigo-50 text-primary dark:bg-indigo-500/10">
            <FolderKanban size={24} />
          </div>
          <p className="mt-4 font-semibold">No projects yet</p>
          <p className="mt-1 text-sm text-text-muted">Create a project to define scope, assign tasks, and track progress.</p>
          <Button className="mt-4" onClick={() => setOpen(true)}>
            <Plus size={16} />
            Create Project
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {projects.map((project) => {
            const selected = project.id === activeProjectId
            const taskCount = project._count?.tasks || 0
            const memberCount = project._count?.members || 0
            const progress = taskCount ? Math.min(92, 28 + taskCount * 8) : 12

            return (
              <Card key={project.id} className={cn("group overflow-hidden p-0", selected && "border-primary ring-4 ring-indigo-100 dark:ring-indigo-500/20")}>
                <div className="h-2 bg-[linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4)]" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <button className="min-w-0 flex-1 text-left" onClick={() => onSelectProject(project.id)}>
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-xl font-semibold">{project.name}</h3>
                        {selected ? <CheckCircle2 size={17} className="text-primary" /> : null}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-muted">{project.description || "No project goal has been added yet."}</p>
                    </button>
                    <button
                      className="grid size-10 place-items-center rounded-xl text-rose-500 transition hover:scale-105 hover:bg-rose-50 hover:shadow-lg dark:hover:bg-rose-500/10"
                      title="Delete project"
                      onClick={() => onDeleteProject?.(project.id)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-surface-muted p-3">
                      <p className="text-lg font-semibold">{taskCount}</p>
                      <p className="text-xs text-text-muted">Tasks</p>
                    </div>
                    <div className="rounded-2xl bg-surface-muted p-3">
                      <p className="text-lg font-semibold">{memberCount}</p>
                      <p className="text-xs text-text-muted">Members</p>
                    </div>
                    <div className="rounded-2xl bg-surface-muted p-3">
                      <CalendarDays size={17} className="text-primary" />
                      <p className="mt-2 text-xs text-text-muted">Updated recently</p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-xs text-text-muted">
                      <span>Delivery confidence</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,#6366f1,#8b5cf6)]" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <button className="mt-5 flex w-full items-center justify-between text-sm font-semibold text-primary" onClick={() => onSelectProject(project.id)}>
                    <span>{selected ? "Current project" : "Open project"}</span>
                    <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={open} title="Create project" onClose={() => setOpen(false)}>
        <ProjectForm creating={creating} onCreateProject={onCreateProject} onClose={() => setOpen(false)} />
      </Modal>
    </div>
  )
}
