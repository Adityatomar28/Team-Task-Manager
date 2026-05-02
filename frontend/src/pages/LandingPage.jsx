import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2, Clock3, FolderKanban, KanbanSquare, LockKeyhole, Play, ShieldCheck, Sparkles, UsersRound } from "lucide-react"
import { SignInButton, SignUpButton } from "@clerk/react"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Avatar } from "../components/ui/Avatar"

const features = [
  { icon: KanbanSquare, title: "Task Management", description: "Create, assign, and track tasks easily" },
  { icon: UsersRound, title: "Team Collaboration", description: "Manage team members and roles" },
  { icon: Sparkles, title: "Smart Dashboard", description: "Track progress and overdue tasks" },
  { icon: ShieldCheck, title: "Role-Based Access", description: "Admin and member permissions" },
]

const steps = [
  { icon: FolderKanban, title: "Create Project" },
  { icon: UsersRound, title: "Assign Tasks" },
  { icon: CheckCircle2, title: "Track Progress" },
]

const testimonials = [
  {
    name: "Aarav Mehta",
    role: "Product Lead",
    message: "TeamSync makes our weekly planning feel calm. Everyone sees ownership, status, and blockers without another meeting.",
  },
  {
    name: "Sarah Chen",
    role: "Engineering Manager",
    message: "The dashboard gives us the right signal fast: overdue work, active tasks, and who needs help today.",
  },
  {
    name: "John Miller",
    role: "Founder",
    message: "It looks polished enough for clients and simple enough for interns to start using on day one.",
  },
]

const linkedinUrl = "https://www.linkedin.com/in/aditya-singh-tomar-1683a3279/"

function AuthPanel() {
  return (
    <motion.div
      id="auth"
      className="mx-auto mt-16 w-full max-w-md rounded-2xl border border-white/70 bg-white/85 p-6 shadow-2xl shadow-indigo-950/10 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
    >
      <div className="text-center">
        <p className="text-sm font-semibold text-primary">Welcome back</p>
        <h2 className="mt-2 text-2xl font-semibold">Access your workspace</h2>
        <p className="mt-2 text-sm text-text-muted">Use your TeamSync account to sign in or create a new one.</p>
      </div>
      <div className="mt-6 space-y-3">
        {["Name", "Email", "Password"].map((label) => (
          <div key={label} className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <input
              className="h-11 w-full rounded-xl border bg-white/90 px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-indigo-100 dark:bg-slate-900 dark:focus:ring-indigo-500/20"
              placeholder={label === "Password" ? "••••••••" : label}
              type={label === "Password" ? "password" : "text"}
            />
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <SignInButton>
          <Button type="button">Sign In</Button>
        </SignInButton>
        <SignUpButton>
          <Button type="button" variant="secondary">Sign Up</Button>
        </SignUpButton>
      </div>
    </motion.div>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_48%,#ffffff_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.24),transparent_34%),linear-gradient(180deg,#080b14_0%,#111827_52%,#080b14_100%)]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] font-bold text-white shadow-lg shadow-indigo-500/20">TS</div>
          <span className="text-lg font-semibold">TeamSync</span>
        </div>
        <nav className="hidden items-center gap-7 text-sm font-medium text-text-muted md:flex">
          <a href="#product" className="hover:text-text">Product</a>
          <a href="#features" className="hover:text-text">Features</a>
          <a href="#pricing" className="hover:text-text">Pricing</a>
          <a href={linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-text">Connect with LinkedIn</a>
        </nav>
        <SignInButton>
          <Button type="button" variant="secondary">Sign In</Button>
        </SignInButton>
      </header>

      <main>
        <section id="product" className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1fr,0.95fr] lg:px-8 lg:pt-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-semibold text-primary shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
              <Sparkles size={14} />
              Built for modern delivery teams
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal text-text md:text-7xl">
              Manage Projects. Assign Tasks. Track Progress.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-text-muted">
              TeamSync helps teams collaborate, assign work, and deliver projects faster.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <SignUpButton>
                <Button type="button" className="h-12 px-6">
                  Get Started
                  <ArrowRight size={17} />
                </Button>
              </SignUpButton>
              <a href="#demo">
                <Button type="button" variant="secondary" className="h-12 w-full px-6 sm:w-auto">
                  <Play size={17} />
                  View Demo
                </Button>
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-sm text-text-muted">
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" /> No setup friction</span>
              <span className="flex items-center gap-2"><LockKeyhole size={16} className="text-primary" /> Role-based permissions</span>
              <span className="flex items-center gap-2"><Clock3 size={16} className="text-amber-600" /> Overdue tracking</span>
            </div>
          </motion.div>

          <motion.div
            id="demo"
            className="relative rounded-2xl border border-white/80 bg-white/85 p-5 shadow-2xl shadow-indigo-950/12 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85"
            initial={{ opacity: 0, y: 30, rotateX: 8 }}
            animate={{ opacity: 1, y: [0, -10, 0], rotateX: 0 }}
            transition={{ opacity: { duration: 0.5, delay: 0.15 }, y: { repeat: Infinity, duration: 6, ease: "easeInOut" } }}
          >
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-[linear-gradient(135deg,rgba(99,102,241,0.28),rgba(168,85,247,0.2))] blur-2xl" />
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-xs font-semibold uppercase text-primary">Live workspace</p>
                <h2 className="mt-1 text-xl font-semibold">Launch Board</h2>
              </div>
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">72% on track</div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["Projects", "12"],
                ["Active Tasks", "48"],
                ["Overdue", "3"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border bg-surface p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]">
                  <p className="text-xs text-text-muted">{label}</p>
                  <p className="mt-2 text-2xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3">
              {[
                ["Design onboarding flow", "IN PROGRESS", "HIGH"],
                ["Invite workspace members", "TODO", "MEDIUM"],
                ["Publish sprint report", "DONE", "LOW"],
              ].map(([title, status, priority]) => (
                <div key={title} className="flex items-center justify-between rounded-2xl border bg-surface p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]">
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="mt-1 text-xs text-text-muted">{priority} priority</p>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-primary dark:bg-indigo-500/10">{status}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold text-primary">Features</p>
              <h2 className="mt-2 text-3xl font-semibold">Everything your team needs to ship</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-text-muted">A focused workspace for projects, tasks, members, permissions, and delivery signals.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
                  <Card className="group h-full hover:scale-[1.03]">
                    <div className="grid size-11 place-items-center rounded-2xl bg-indigo-50 text-primary transition group-hover:scale-110 dark:bg-indigo-500/10">
                      <Icon size={21} />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-text-muted">{feature.description}</p>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="overflow-hidden bg-[linear-gradient(135deg,#ffffff,#eef2ff)] dark:bg-[linear-gradient(135deg,#0f172a,#1e1b4b)]">
            <p className="text-sm font-semibold text-primary">How it works</p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <motion.div key={step.title} className="relative" initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                    <div className="flex items-center gap-4">
                      <div className="grid size-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-white shadow-lg shadow-indigo-500/20">
                        <Icon size={21} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-text-muted">Step {index + 1}</p>
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                      </div>
                    </div>
                    {index < steps.length - 1 ? <div className="mt-6 hidden h-px bg-gradient-to-r from-indigo-300 to-transparent md:block" /> : null}
                  </motion.div>
                )
              })}
            </div>
          </Card>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-semibold text-primary">Testimonials</p>
            <h2 className="mt-2 text-3xl font-semibold">Teams feel organized faster</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="hover:scale-[1.03]">
                <div className="flex items-center gap-3">
                  <Avatar name={testimonial.name} />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-text-muted">{testimonial.role}</p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-6 text-text-muted">"{testimonial.message}"</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] px-6 py-14 text-white shadow-2xl shadow-indigo-500/20">
            <h2 className="text-3xl font-semibold">Start managing your team today</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-indigo-100">Create a workspace, invite members, assign tasks, and track delivery from one polished dashboard.</p>
            <SignUpButton>
              <button className="mt-7 h-12 rounded-xl bg-white px-6 text-sm font-semibold text-indigo-700 transition hover:scale-[1.05]">
                Create Account
              </button>
            </SignUpButton>
          </div>
          <AuthPanel />
        </section>
      </main>

      <footer id="contact" className="border-t border-border/70 px-4 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-text-muted md:flex-row md:items-center md:justify-between">
          <p>
            Made by{" "}
            <a href={linkedinUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:text-primary-strong">
              Aditya Singh Tomar
            </a>
          </p>
          <div id="pricing" className="flex flex-wrap gap-5">
            <a href="#product" className="hover:text-text">Product</a>
            <a href="#features" className="hover:text-text">Features</a>
            <a href="#pricing" className="hover:text-text">Pricing</a>
            <a href={linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-text">Connect with LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
