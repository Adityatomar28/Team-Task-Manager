import { useState } from "react"
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Avatar } from "../components/ui/Avatar"
import { Modal } from "../components/ui/Modal"

export function TeamsPage({ teams, creating, onCreateTeam }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) {
      setError("Team name is required")
      return
    }

    await onCreateTeam({ name, description })
    setName("")
    setDescription("")
    setError("")
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Team Management</h2>
          <p className="mt-1 text-sm text-text-muted">Manage team structure and ownership.</p>
        </div>
        <Button onClick={() => setOpen(true)}>Create Team</Button>
      </div>

      {teams.length === 0 ? (
        <Card>
          <p className="font-medium">No teams yet</p>
          <p className="mt-1 text-sm text-text-muted">Create your first team to start collaboration.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="truncate text-base font-semibold">{team.name}</h3>
                <Avatar name={team.owner?.name || "Team Owner"} />
              </div>
              <p className="line-clamp-2 text-sm text-text-muted">{team.description || "No team description."}</p>
              <p className="text-xs text-text-muted">{team._count?.members || 0} members</p>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} title="Create team" onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Team Name</label>
            <input
              className="h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Platform"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full rounded-xl border bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="What this team is responsible for..."
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
