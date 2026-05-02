import { useMemo } from "react"
import { DndContext, PointerSensor, useDroppable, useSensor, useSensors, closestCenter } from "@dnd-kit/core"
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"

const columns = ["TODO", "IN_PROGRESS", "DONE"]

function TaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id, data: { status: task.status } })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <article ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab rounded-xl border bg-white p-3 shadow-sm active:cursor-grabbing">
      <p className="truncate font-medium" title={task.title}>{task.title}</p>
      <div className="mt-2 flex items-center gap-2">
        <Badge value={task.priority} />
        <Badge value={task.status} />
      </div>
      <p className="mt-2 text-xs text-text-muted">
        Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
      </p>
    </article>
  )
}

function TaskColumn({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { status: id } })
  return (
    <div ref={setNodeRef} className={isOver ? "rounded-xl ring-2 ring-indigo-200" : ""}>
      {children}
    </div>
  )
}

export function TasksPage({ tasks, onMoveTask }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const grouped = useMemo(() => {
    return columns.reduce((acc, key) => ({ ...acc, [key]: tasks.filter((task) => task.status === key) }), {})
  }, [tasks])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Task Management</h2>
        <p className="mt-1 text-sm text-text-muted">Drag and drop tasks across status columns.</p>
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
        <div className="grid gap-4 md:grid-cols-3">
          {columns.map((column) => (
            <TaskColumn key={column} id={column}>
              <Card className="space-y-3 bg-surface-muted/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{column.replace("_", " ")}</p>
                  <span className="text-xs text-text-muted">{grouped[column].length}</span>
                </div>
                <SortableContext id={column} items={grouped[column].map((task) => task.id)} strategy={rectSortingStrategy}>
                  <div className="space-y-3">
                    {grouped[column].length === 0 ? (
                      <p className="rounded-xl border border-dashed p-4 text-center text-xs text-text-muted">No tasks</p>
                    ) : (
                      grouped[column].map((task) => <TaskCard key={task.id} task={task} />)
                    )}
                  </div>
                </SortableContext>
              </Card>
            </TaskColumn>
          ))}
        </div>
      </DndContext>
    </div>
  )
}
