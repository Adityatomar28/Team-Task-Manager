import { useMemo, useState } from "react"
import { DndContext, PointerSensor, useDroppable, useSensor, useSensors, closestCenter } from "@dnd-kit/core"
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { CheckCircle2, Clock3, Edit3, Flag, ListFilter, Plus, UserRound } from "lucide-react"
import { Card } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Modal } from "../components/ui/Modal"
import { cn } from "../utils/cn"

const columns = [
  { id: "TODO", label: "Todo" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "DONE", label: "Done" },
]

const emptyTask = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  dueDate: "",
  assignedToId: "",
}

function toDateInput(value) {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

function TaskForm({ members, initialTask, submitLabel, submitting, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    ...emptyTask,
    ...initialTask,
    dueDate: toDateInput(initialTask?.dueDate),
    assignedToId: initialTask?.assignedToId || "",
  }))
  const [error, setError] = useState("")

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")
    if (!form.title.trim()) {
      setError("Task title is required")
      return
    }

    await onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || null,
      assignedToId: form.assignedToId || null,
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium">Task title</label>
        <input
          className="h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-indigo-100 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-indigo-500/20"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="Design onboarding flow"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <textarea
          className="min-h-24 w-full rounded-xl border bg-white p-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-indigo-100 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-indigo-500/20"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="Add context, acceptance notes, or blockers"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <select className="h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-950 dark:bg-slate-950 dark:text-white" value={form.status} onChange={(event) => updateField("status", event.target.value)}>
            {columns.map((column) => <option key={column.id} value={column.id}>{column.label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <select className="h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-950 dark:bg-slate-950 dark:text-white" value={form.priority} onChange={(event) => updateField("priority", event.target.value)}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Assignee</label>
          <select className="h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-950 dark:bg-slate-950 dark:text-white" value={form.assignedToId} onChange={(event) => updateField("assignedToId", event.target.value)}>
            <option value="">Unassigned</option>
            {members.map((member) => <option key={member.userId} value={member.userId}>{member.name} ({member.role})</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Due date</label>
          <input className="h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-950 dark:bg-slate-950 dark:text-white" type="date" value={form.dueDate} onChange={(event) => updateField("dueDate", event.target.value)} />
        </div>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button disabled={submitting}>{submitting ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  )
}

function TaskCard({ task, onEdit, onStatusChange }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id, data: { status: task.status } })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const overdue = task.dueDate && task.status !== "DONE" && new Date(task.dueDate) < new Date()

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group rounded-xl border bg-white p-4 text-slate-950 shadow-sm transition hover:-translate-y-2 hover:border-indigo-200 hover:shadow-[var(--shadow-card-hover)] active:cursor-grabbing dark:bg-slate-950 dark:text-white",
        task.status === "DONE" && "bg-emerald-50/50 dark:bg-emerald-500/10"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <button className="min-w-0 text-left" onClick={() => onEdit(task)}>
          <p className="line-clamp-2 font-semibold text-text" title={task.title}>{task.title}</p>
          {task.description ? <p className="mt-1 line-clamp-2 text-xs text-text-muted">{task.description}</p> : null}
        </button>
        <button className="rounded-lg p-1 text-text-muted opacity-0 transition hover:bg-slate-100 hover:text-text group-hover:opacity-100" onClick={() => onEdit(task)}>
          <Edit3 size={15} />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge value={task.priority} />
        <Badge value={task.status} />
        {overdue ? <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">OVERDUE</span> : null}
      </div>
      <div className="mt-3 space-y-2 text-xs text-text-muted">
        <p className="flex items-center gap-2"><Clock3 size={14} /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</p>
        <p className="flex items-center gap-2"><UserRound size={14} /> {task.assignedTo?.name || "Unassigned"}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button className="h-9 px-3 text-xs" variant="secondary" onClick={() => onStatusChange(task.id, task.status === "IN_PROGRESS" ? "TODO" : "IN_PROGRESS")}>
          <Clock3 size={14} />
          {task.status === "IN_PROGRESS" ? "Pause" : "Start"}
        </Button>
        <Button className="h-9 px-3 text-xs" onClick={() => onStatusChange(task.id, "DONE")}>
          <CheckCircle2 size={14} />
          Done
        </Button>
      </div>
    </article>
  )
}

function TaskColumn({ id, title, tasks, children }) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { status: id } })
  return (
    <div ref={setNodeRef} className={cn("rounded-2xl border bg-surface-muted/60 p-4 transition", isOver && "ring-4 ring-indigo-100")}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wide text-text">{title}</p>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-text-muted shadow-sm dark:bg-slate-950">{tasks.length}</span>
      </div>
      {children}
    </div>
  )
}

export function TasksPage({
  tasks = [],
  members = [],
  activeProject,
  composerOpen,
  onComposerOpenChange,
  onCreateTask,
  onUpdateTask,
  onMoveTask,
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const [selectedTask, setSelectedTask] = useState(null)
  const [query, setQuery] = useState("")
  const [priority, setPriority] = useState("ALL")
  const [submitting, setSubmitting] = useState(false)

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => (priority === "ALL" ? true : task.priority === priority))
      .filter((task) => [task.title, task.description, task.assignedTo?.name].join(" ").toLowerCase().includes(query.toLowerCase()))
  }, [priority, query, tasks])

  const grouped = useMemo(() => {
    return columns.reduce((acc, column) => ({ ...acc, [column.id]: filteredTasks.filter((task) => task.status === column.id) }), {})
  }, [filteredTasks])

  async function submitCreateTask(data) {
    setSubmitting(true)
    try {
      await onCreateTask(data)
    } finally {
      setSubmitting(false)
    }
  }

  async function submitUpdateTask(data) {
    if (!selectedTask) return
    setSubmitting(true)
    try {
      await onUpdateTask(selectedTask.id, data)
      setSelectedTask(null)
    } finally {
      setSubmitting(false)
    }
  }

  const doneCount = tasks.filter((task) => task.status === "DONE").length
  const completion = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.3fr,1fr]">
        <Card className="overflow-hidden bg-[linear-gradient(135deg,#ffffff_0%,#eef2ff_100%)] dark:bg-[linear-gradient(135deg,#0f172a_0%,#111827_100%)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Active project</p>
              <h2 className="mt-1 text-xl font-semibold">{activeProject?.name || "Select a team"}</h2>
              <p className="mt-1 text-sm text-text-muted">{activeProject?.description || "Create or select a team before planning tasks."}</p>
            </div>
            <Button onClick={() => onComposerOpenChange(true)} disabled={!activeProject}>
              <Plus size={16} />
              Create Task
            </Button>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Progress</p>
              <p className="mt-1 text-2xl font-semibold">{completion}% complete</p>
            </div>
            <Flag className="text-primary" size={28} />
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completion}%` }} />
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border bg-white p-3 shadow-sm transition hover:shadow-[var(--shadow-card-hover)] md:flex-row md:items-center dark:bg-surface">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-surface-muted px-3">
          <ListFilter size={16} className="text-text-muted" />
          <input
            className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-400"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tasks by title, notes, or assignee"
          />
        </div>
        <select className="h-11 rounded-xl border bg-white px-3 text-sm text-slate-950 dark:bg-slate-950 dark:text-white" value={priority} onChange={(event) => setPriority(event.target.value)}>
          <option value="ALL">All priorities</option>
          <option value="HIGH">High priority</option>
          <option value="MEDIUM">Medium priority</option>
          <option value="LOW">Low priority</option>
        </select>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const from = event.active.data.current?.status
          const to = event.over?.data?.current?.status || event.over?.id
          if (from && to && from !== to) onMoveTask(event.active.id, to)
        }}
      >
        <div className="grid gap-4 xl:grid-cols-3">
          {columns.map((column) => (
            <TaskColumn key={column.id} id={column.id} title={column.label} tasks={grouped[column.id]}>
              <SortableContext id={column.id} items={grouped[column.id].map((task) => task.id)} strategy={rectSortingStrategy}>
                <div className="space-y-3">
                  {grouped[column.id].length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-white/70 p-6 text-center text-sm text-text-muted dark:bg-slate-950/70">
                      No tasks here
                    </div>
                  ) : (
                    grouped[column.id].map((task) => (
                      <TaskCard key={task.id} task={task} onEdit={setSelectedTask} onStatusChange={onMoveTask} />
                    ))
                  )}
                </div>
              </SortableContext>
            </TaskColumn>
          ))}
        </div>
      </DndContext>

      <Modal open={composerOpen} title="Create task" onClose={() => onComposerOpenChange(false)}>
        <TaskForm members={members} submitLabel="Create Task" submitting={submitting} onSubmit={submitCreateTask} onCancel={() => onComposerOpenChange(false)} />
      </Modal>

      <Modal open={Boolean(selectedTask)} title="Edit task" onClose={() => setSelectedTask(null)}>
        {selectedTask ? (
          <TaskForm members={members} initialTask={selectedTask} submitLabel="Save Changes" submitting={submitting} onSubmit={submitUpdateTask} onCancel={() => setSelectedTask(null)} />
        ) : null}
      </Modal>
    </div>
  )
}
