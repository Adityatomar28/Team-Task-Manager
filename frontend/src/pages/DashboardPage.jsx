import { Card } from "../components/ui/Card"
import { Skeleton } from "../components/ui/Skeleton"
import { activityFeed } from "../utils/mockData"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts"

const trendData = [
  { day: "Mon", done: 8 },
  { day: "Tue", done: 12 },
  { day: "Wed", done: 10 },
  { day: "Thu", done: 14 },
  { day: "Fri", done: 16 },
  { day: "Sat", done: 11 },
  { day: "Sun", done: 15 },
]

export function DashboardPage({ dashboard, loading }) {
  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        {[...Array(3)].map((_, idx) => <Skeleton key={idx} className="h-32" />)}
      </div>
    )
  }

  const stats = [
    { label: "Total Teams", value: dashboard?.projects ?? 0 },
    { label: "Assigned Tasks", value: dashboard?.assignedTasks ?? 0 },
    { label: "Overdue Tasks", value: dashboard?.overdueTasks ?? 0 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-text-muted">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold">{item.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <Card>
          <p className="mb-4 text-sm font-medium text-text-muted">Task completion trend</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="fillDone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="done" stroke="#4f46e5" fill="url(#fillDone)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <p className="mb-4 text-sm font-medium text-text-muted">Recent activity</p>
          <div className="space-y-3">
            {activityFeed.map((item) => (
              <div key={item.id} className="rounded-xl bg-surface-muted p-3">
                <p className="text-sm">{item.text}</p>
                <p className="mt-1 text-xs text-text-muted">{item.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
