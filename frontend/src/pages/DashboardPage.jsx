import { motion } from "framer-motion"
import { AlertTriangle, CheckCircle2, Clock3, FolderKanban, ListTodo, RadioTower, TrendingUp, UserRound } from "lucide-react"
import { Card } from "../components/ui/Card"
import { Skeleton } from "../components/ui/Skeleton"
import { Badge } from "../components/ui/Badge"
import { Avatar } from "../components/ui/Avatar"

function isOverdue(task) {
  return task.dueDate && task.status !== "DONE" && new Date(task.dueDate) < new Date()
}

function StatCard({ icon: Icon, label, value, helper, tone = "primary" }) {
  const tones = {
    primary: "bg-indigo-50 text-primary dark:bg-indigo-500/10",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  }

  return (
    <motion.div whileHover={{ scale: 1.03, y: -4 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
      <Card className="group relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#6366f1,#8b5cf6)] opacity-80" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-text-muted">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
            <p className="mt-1 text-xs text-text-muted">{helper}</p>
          </div>
          <div className={`rounded-2xl p-3 transition group-hover:scale-110 ${tones[tone]}`}>
            <Icon size={22} />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function StatusProgress({ label, value, total, tone }) {
  const pct = total ? Math.round((value / total) * 100) : 0
  const fill = {
    TODO: "bg-slate-400",
    IN_PROGRESS: "bg-blue-500",
    DONE: "bg-emerald-500",
  }[tone]

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium">{label.replace("_", " ")}</span>
        <span className="text-text-muted">{value} tasks · {pct}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-surface-muted">
        <motion.div className={`h-full rounded-full ${fill}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
      </div>
    </div>
  )
}

function formatDate(value) {
  if (!value) return "No due date"
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export function DashboardPage({ dashboard, loading, tasks = [], teams = [] }) {
  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, idx) => <Skeleton key={idx} className="h-32" />)}
      </div>
    )
  }

  const done = tasks.filter((task) => task.status === "DONE").length
  const todo = tasks.filter((task) => task.status === "TODO").length
  const inProgress = tasks.filter((task) => task.status === "IN_PROGRESS").length
  const overdueTasks = tasks.filter(isOverdue)
  const completion = tasks.length ? Math.round((done / tasks.length) * 100) : 0
  const recentTasks = tasks.slice(0, 7)
  const activityItems = [
    ...tasks.slice(0, 2).map((task) => ({
      name: task.createdBy?.name || task.assignedTo?.name || "John",
      action: `created ${task.title}`,
      time: "Today",
    })),
    ...tasks.filter((task) => task.status === "DONE").slice(0, 2).map((task) => ({
      name: task.assignedTo?.name || "Sarah",
      action: `completed ${task.title}`,
      time: "This week",
    })),
  ].slice(0, 4)

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FolderKanban} label="Projects" value={dashboard?.projects ?? teams.length} helper="Active workspaces" />
        <StatCard icon={Clock3} label="Active Tasks" value={inProgress} helper="Currently moving" tone="amber" />
        <StatCard icon={CheckCircle2} label="Completed" value={done} helper={`${completion}% completion`} tone="emerald" />
        <StatCard icon={AlertTriangle} label="Overdue" value={dashboard?.overdueTasks ?? overdueTasks.length} helper="Needs attention" tone="rose" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Task Status Overview</p>
              <h2 className="mt-1 text-xl font-semibold">Delivery by status</h2>
            </div>
            <TrendingUp className="text-primary" size={22} />
          </div>
          <div className="space-y-5">
            <StatusProgress label="TODO" value={todo} total={tasks.length} tone="TODO" />
            <StatusProgress label="IN_PROGRESS" value={inProgress} total={tasks.length} tone="IN_PROGRESS" />
            <StatusProgress label="DONE" value={done} total={tasks.length} tone="DONE" />
          </div>
        </Card>

        <Card className="bg-[linear-gradient(135deg,#ffffff,#f5f3ff)] dark:bg-[linear-gradient(135deg,#0f172a,#1e1b4b)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Portfolio health</p>
              <h2 className="mt-1 text-3xl font-semibold">{completion}%</h2>
            </div>
            <div className="grid size-14 place-items-center rounded-2xl bg-white text-primary shadow-sm dark:bg-slate-900">
              <RadioTower size={25} />
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-text-muted">Completed work across the selected project. Keep overdue tasks low to protect delivery confidence.</p>
          <div className="mt-6 h-2 rounded-full bg-white/80 dark:bg-slate-900">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#6366f1,#8b5cf6)]" style={{ width: `${completion}%` }} />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr,0.75fr]">
        <Card>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-text-muted">Recent Tasks Table</p>
              <h2 className="mt-1 text-xl font-semibold">Latest work items</h2>
            </div>
            <ListTodo className="text-primary" size={22} />
          </div>
          <div className="overflow-auto rounded-2xl border">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-muted text-xs uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-3">Task Name</th>
                  <th className="px-4 py-3">Assigned To</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task) => (
                  <tr key={task.id} className="border-t transition hover:bg-surface-muted/70">
                    <td className="px-4 py-3 font-medium">{task.title}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={task.assignedTo?.name || "Unassigned"} />
                        <span>{task.assignedTo?.name || "Unassigned"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge value={isOverdue(task) ? "OVERDUE" : task.status} /></td>
                    <td className="px-4 py-3"><Badge value={task.priority} /></td>
                    <td className="px-4 py-3 text-text-muted">{formatDate(task.dueDate)}</td>
                  </tr>
                ))}
                {recentTasks.length === 0 ? (
                  <tr>
                    <td className="px-4 py-12 text-center text-text-muted" colSpan={5}>
                      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-surface-muted">
                        <ListTodo size={22} />
                      </div>
                      <p className="mt-3 font-medium">No tasks yet</p>
                      <p className="mt-1 text-sm">Create a task to populate your delivery table.</p>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="border-rose-200 bg-rose-50/80 dark:border-rose-500/20 dark:bg-rose-500/10">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200">
                <AlertTriangle size={19} />
              </div>
              <div>
                <p className="font-semibold text-rose-800 dark:text-rose-100">Overdue Tasks</p>
                <p className="text-xs text-rose-700/80 dark:text-rose-100/70">{overdueTasks.length} item{overdueTasks.length === 1 ? "" : "s"} need attention</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {overdueTasks.slice(0, 4).map((task) => (
                <div key={task.id} className="rounded-xl bg-white/80 p-3 text-sm shadow-sm dark:bg-slate-950/50">
                  <p className="font-medium">{task.title}</p>
                  <p className="mt-1 text-xs text-text-muted">{formatDate(task.dueDate)} · {task.assignedTo?.name || "Unassigned"}</p>
                </div>
              ))}
              {overdueTasks.length === 0 ? <p className="rounded-xl bg-white/80 p-3 text-sm text-text-muted dark:bg-slate-950/50">No overdue tasks. Your project is on track.</p> : null}
            </div>
          </Card>

          <Card>
            <div className="mb-5 flex items-center gap-3">
              <UserRound className="text-primary" size={20} />
              <h2 className="font-semibold">Activity Feed</h2>
            </div>
            <div className="space-y-4">
              {(activityItems.length ? activityItems : [
                { name: "John", action: "created a task", time: "Today" },
                { name: "Sarah", action: "completed a task", time: "Yesterday" },
              ]).map((item, index) => (
                <div key={`${item.name}-${index}`} className="flex gap-3">
                  <Avatar name={item.name} />
                  <div className="min-w-0">
                    <p className="text-sm"><span className="font-semibold">{item.name}</span> {item.action}</p>
                    <p className="text-xs text-text-muted">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
