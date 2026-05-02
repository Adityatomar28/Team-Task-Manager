import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Trash2 } from "lucide-react"
import { Card } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Avatar } from "../components/ui/Avatar"
import { Button } from "../components/ui/Button"

export function MembersPage({ rows = [], onAddMember, onDeleteMember }) {
  const [query, setQuery] = useState("")
  const [role, setRole] = useState("ALL")
  const [sortBy, setSortBy] = useState("name")
  const [selectedMember, setSelectedMember] = useState(null)
  const [email, setEmail] = useState("")
  const [newRole, setNewRole] = useState("MEMBER")
  const [submitting, setSubmitting] = useState(false)
  const [inlineError, setInlineError] = useState("")

  const filteredRows = useMemo(() => {
    return rows
      .filter((row) => (role === "ALL" ? true : row.role === role))
      .filter((row) => [row.name, row.email, row.team].join(" ").toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => String(a[sortBy]).localeCompare(String(b[sortBy])))
  }, [query, role, rows, sortBy])

  async function handleAddMember(event) {
    event.preventDefault()
    setInlineError("")
    if (!email.trim()) {
      setInlineError("Email is required")
      return
    }

    try {
      setSubmitting(true)
      await onAddMember?.({ email: email.trim(), role: newRole })
      setEmail("")
    } catch (error) {
      setInlineError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Member Management</h2>
        <p className="mt-1 text-sm text-text-muted">Search, filter, and review members.</p>
      </div>

      <Card className="space-y-4">
        <form className="grid gap-3 rounded-xl bg-surface-muted p-3 md:grid-cols-[1fr,160px,120px]" onSubmit={handleAddMember}>
          <input
            className="h-10 rounded-xl border bg-white px-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-200 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400"
            placeholder="Add member by email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <select
            className="h-10 rounded-xl border bg-white px-3 text-sm text-slate-950 dark:bg-slate-950 dark:text-white"
            value={newRole}
            onChange={(event) => setNewRole(event.target.value)}
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
          <Button disabled={submitting}>{submitting ? "Adding..." : "Add Member"}</Button>
          {inlineError ? <p className="text-xs text-rose-600 md:col-span-3">{inlineError}</p> : null}
        </form>

        <div className="flex flex-wrap gap-3">
          <input
            className="h-10 min-w-56 rounded-xl border bg-white px-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-200 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400"
            placeholder="Search members..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select className="h-10 rounded-xl border bg-white px-3 text-sm text-slate-950 dark:bg-slate-950 dark:text-white" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="MEMBER">Member</option>
          </select>
          <select className="h-10 rounded-xl border bg-white px-3 text-sm text-slate-950 dark:bg-slate-950 dark:text-white" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Sort: Name</option>
            <option value="team">Sort: Team</option>
            <option value="role">Sort: Role</option>
          </select>
        </div>

        <div className="overflow-auto rounded-xl border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted text-text-muted">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="cursor-pointer border-t transition hover:bg-slate-50 hover:shadow-sm dark:hover:bg-slate-900" onClick={() => setSelectedMember(row)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={row.name} />
                      <div>
                        <p className="font-medium">{row.name}</p>
                        <p className="max-w-56 truncate text-xs text-text-muted" title={row.email}>{row.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{row.team}</td>
                  <td className="px-4 py-3"><Badge value={row.role} /></td>
                  <td className="px-4 py-3">{row.status}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="inline-flex size-9 items-center justify-center rounded-xl text-rose-500 transition hover:scale-105 hover:bg-rose-50 hover:shadow-lg dark:hover:bg-rose-500/10"
                      title="Delete member"
                      onClick={(event) => {
                        event.stopPropagation()
                        onDeleteMember?.(row.id)
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-text-muted" colSpan={5}>
                    No members found for this project.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {selectedMember ? (
          <motion.div className="fixed inset-0 z-50 bg-slate-950/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedMember(null)}>
            <motion.aside
              className="absolute right-0 top-0 h-full w-full max-w-md bg-surface p-6 shadow-2xl"
              initial={{ x: 360 }}
              animate={{ x: 0 }}
              exit={{ x: 360 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold">Profile</h3>
              <div className="mt-6 space-y-3">
                <p><span className="text-text-muted">Name:</span> {selectedMember.name}</p>
                <p><span className="text-text-muted">Email:</span> {selectedMember.email}</p>
                <p><span className="text-text-muted">Team:</span> {selectedMember.team}</p>
                <p><span className="text-text-muted">Role:</span> {selectedMember.role}</p>
                <p><span className="text-text-muted">Status:</span> {selectedMember.status}</p>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
