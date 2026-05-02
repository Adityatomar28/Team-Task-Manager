import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Card } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Avatar } from "../components/ui/Avatar"
import { memberRows } from "../utils/mockData"

export function MembersPage() {
  const [query, setQuery] = useState("")
  const [role, setRole] = useState("ALL")
  const [sortBy, setSortBy] = useState("name")
  const [selectedMember, setSelectedMember] = useState(null)

  const rows = useMemo(() => {
    return memberRows
      .filter((row) => (role === "ALL" ? true : row.role === role))
      .filter((row) => [row.name, row.email, row.team].join(" ").toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => String(a[sortBy]).localeCompare(String(b[sortBy])))
  }, [query, role, sortBy])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Member Management</h2>
        <p className="mt-1 text-sm text-text-muted">Search, filter, and review members.</p>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <input
            className="h-10 min-w-56 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Search members..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select className="h-10 rounded-xl border bg-white px-3 text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="MEMBER">Member</option>
          </select>
          <select className="h-10 rounded-xl border bg-white px-3 text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
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
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="cursor-pointer border-t hover:bg-slate-50" onClick={() => setSelectedMember(row)}>
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
                </tr>
              ))}
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
