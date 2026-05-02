import { useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react"
import { sendChatMessage } from "../api"
import { Button } from "./ui/Button"

const starterMessages = [
  {
    role: "assistant",
    content: "Hi, I am Project management system. Ask me for sprint risks, workload summaries, task breakdowns, or the next best actions for this project.",
  },
]

export function Chatbot({ getAuth, activeProjectId }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(starterMessages)
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const messagesRef = useRef(null)

  const canSend = useMemo(() => draft.trim().length > 0 && !loading, [draft, loading])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!canSend) return

    const content = draft.trim()
    const nextMessages = [...messages, { role: "user", content }]
    setMessages(nextMessages)
    setDraft("")
    setLoading(true)
    setError("")

    requestAnimationFrame(() => {
      messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" })
    })

    try {
      const auth = await getAuth()
      const response = await sendChatMessage(auth, {
        message: content,
        messages: messages.filter((message) => message.role !== "system"),
        projectId: activeProjectId,
      })
      setMessages((current) => [...current, response.data])
      requestAnimationFrame(() => {
        messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" })
      })
    } catch (chatError) {
      setError(chatError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end md:bottom-6 md:right-6">
      <AnimatePresence>
        {open ? (
          <motion.section
            className="mb-3 flex h-[min(640px,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-9 place-items-center rounded-xl bg-primary text-white">
                  <Bot size={18} />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold">Project management system</h2>
                  <p className="truncate text-xs text-text-muted">Workspace assistant</p>
                </div>
              </div>
              <button
                aria-label="Close chat"
                className="grid size-9 place-items-center rounded-lg text-text-muted transition hover:bg-surface-muted hover:text-text"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </header>

            <div ref={messagesRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-bg px-4 py-4">
              {messages.map((message, index) => {
                const fromUser = message.role === "user"
                return (
                  <div key={`${message.role}-${index}`} className={`flex ${fromUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-6 ${
                        fromUser
                          ? "rounded-br-md bg-primary text-white"
                          : "rounded-bl-md border border-border bg-surface text-text"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                )
              })}
              {loading ? (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-surface px-3 py-2 text-sm text-text-muted">
                    <Loader2 className="animate-spin" size={15} />
                    Thinking
                  </div>
                </div>
              ) : null}
            </div>

            {error ? (
              <div className="border-t border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700">
                {error}
              </div>
            ) : null}

            <form className="flex gap-2 border-t border-border bg-surface p-3" onSubmit={handleSubmit}>
              <textarea
                className="min-h-10 flex-1 resize-none rounded-xl border border-border bg-white px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400"
                rows={1}
                placeholder="Ask about priorities, risks, or next steps..."
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    handleSubmit(event)
                  }
                }}
              />
              <Button className="size-10 shrink-0 rounded-xl p-0" disabled={!canSend} aria-label="Send message">
                {loading ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
              </Button>
            </form>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <button
        aria-label="Open Project management system chat"
        className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_12px_30px_rgba(79,70,229,0.35)] transition hover:scale-[1.02] hover:bg-primary-strong"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  )
}
