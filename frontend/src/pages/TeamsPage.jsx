import { useState } from "react"
import { CheckCircle2, ClipboardList, Crown, Plus, Trash2, UserPlus, UsersRound } from "lucide-react"
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Avatar } from "../components/ui/Avatar"
import { Modal } from "../components/ui/Modal"
import { cn } from "../utils/cn"

function TeamStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-surface-muted p-3">
      <Icon size={16} className="text-primary" />
      <p className="mt-2 text-lg font-semibold">{value}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  )
}

export function TeamsPage({ teams, activeProjectId, creating, onCreateTeam, onSelectTeam, onDeleteTeam }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")

  const totalMembers = teams.reduce((sum, team) => sum + (team._count?.members || 0), 0)
  const totalTasks = teams.reduce((sum, team) => sum + (team._count?.tasks || 0), 0)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) {
      setError("Team name is required")
      return
    }

    try {
      await onCreateTeam({ name, description })
      setName("")
      setDescription("")
      setError("")
      setOpen(false)
    } catch (submitError) {
      setError(submitError.message)
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
        <Card className="overflow-hidden bg-[linear-gradient(135deg,#ffffff_0%,#ecfeff_100%)] dark:bg-[linear-gradient(135deg,#0f172a_0%,#083344_100%)]">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Team directory</p>
              <h2 className="mt-2 text-2xl font-semibold">People, owners, and roles</h2>
              <p className="mt-2 max-w-2xl text-sm text-text-muted">
                Teams are about collaborators. Review who owns each workspace, how many members are involved, and where help is needed.
              </p>
            </div>
            <Button onClick={() => setOpen(true)}>
              <UserPlus size={16} />
              Create Team
            </Button>
          </div>
        </Card>
        <div className="grid grid-cols-3 gap-3">
          <TeamStat icon={Crown} label="Teams" value={teams.length} />
          <TeamStat icon={UsersRound} label="Members" value={totalMembers} />
          <TeamStat icon={ClipboardList} label="Tasks" value={totalTasks} />
        </div>
      </section>

      {teams.length === 0 ? (
        <Card className="border-dashed bg-white/80 text-center dark:bg-slate-950/70">
          <p className="font-semibold">No teams yet</p>
          <p className="mt-1 text-sm text-text-muted">Create your first team to unlock task planning, members, and progress tracking.</p>
          <Button className="mt-4" onClick={() => setOpen(true)}>
            <Plus size={16} />
            Create Team
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => {
            const selected = team.id === activeProjectId
            const memberCount = team._count?.members || 0
            const taskCount = team._count?.tasks || 0
            return (
              <div key={team.id} className="text-left">
                <Card className={cn(
                  "group h-full overflow-hidden p-0 hover:-translate-y-2 hover:shadow-[var(--shadow-card-hover)]",
                  selected && "border-primary ring-4 ring-indigo-100"
                )}>
                  <div className="h-2 bg-[linear-gradient(90deg,#06b6d4,#6366f1)]" />
                  <div className="space-y-5 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <button className="min-w-0 flex-1 text-left" onClick={() => onSelectTeam(team.id)}>
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-lg font-semibold">{team.name}</h3>
                          {selected ? <CheckCircle2 size={16} className="shrink-0 text-primary" /> : null}
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-text-muted">{team.description || "No team description yet."}</p>
                      </button>
                      <div className="flex items-center gap-2">
                        <Avatar name={team.owner?.name || team.name} />
                        <button
                          className="grid size-9 place-items-center rounded-xl text-rose-500 transition hover:scale-105 hover:bg-rose-50 hover:shadow-lg dark:hover:bg-rose-500/10"
                          title="Delete project"
                          onClick={(event) => {
                            event.stopPropagation()
                            onDeleteTeam?.(team.id)
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-surface-muted p-3">
                        <p className="text-lg font-semibold">{memberCount}</p>
                        <p className="text-xs text-text-muted">People</p>
                      </div>
                      <div className="rounded-xl bg-surface-muted p-3">
                        <p className="text-lg font-semibold">{taskCount}</p>
                        <p className="text-xs text-text-muted">Assigned work</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-surface-muted p-3">
                      <div className="flex -space-x-2">
                        {[team.owner?.name || team.name, "Member", "Admin"].slice(0, Math.max(1, Math.min(3, memberCount || 1))).map((name, index) => (
                          <Avatar key={`${team.id}-${index}`} name={name} />
                        ))}
                      </div>
                      <button className="text-sm font-medium text-primary" onClick={() => onSelectTeam(team.id)}>
                        {selected ? "Managing team" : "Manage team"}
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={open} title="Create team" onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Team Name</label>
            <input
              className="h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-indigo-100 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-indigo-500/20"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Product Launch"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="min-h-28 w-full rounded-xl border bg-white p-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-indigo-100 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-indigo-500/20"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What this team owns, ships, or supports..."
            />
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={creating}>{creating ? "Creating..." : "Create Team"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
