'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { Bot, Send, Sparkles, X } from 'lucide-react'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const starterMessages: ChatMessage[] = [
  {
    role: 'assistant',
    content: 'Halo, saya asisten GROMAR. Ada yang ingin kamu tanyakan soal marketplace, kontrak, atau alur pemesanan?',
  },
]

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, open])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmed = input.trim()
    if (!trimmed || loading) return

    const nextMessages = [...messages, { role: 'user', content: trimmed }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })

      const data = (await response.json()) as { reply?: string; error?: string }

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengirim pesan')
      }

      setMessages((current) => [...current, { role: 'assistant', content: data.reply || 'Maaf, saya belum punya jawaban untuk itu.' }])
    } catch (chatError) {
      const message = chatError instanceof Error ? chatError.message : 'Terjadi kesalahan'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0f172a] px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(15,23,42,0.35)] transition-transform hover:-translate-y-0.5"
        aria-expanded={open}
        aria-label={open ? 'Tutup chat' : 'Buka chat support'}
      >
        <Sparkles className="h-4 w-4 text-emerald-300" />
        Chat Support
      </button>

      {open && (
        <section className="fixed bottom-20 right-5 z-50 flex w-[min(92vw,380px)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
          <header className="flex items-center justify-between bg-gradient-to-r from-[#0c3b1e] via-[#0b2f3a] to-[#0a2f5e] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">GROMAR Assistant</p>
                <p className="text-xs text-white/70">Customer service untuk marketplace</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Tutup chat"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="max-h-[420px] space-y-3 overflow-y-auto bg-gradient-to-b from-slate-50 to-white px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'bg-emerald-50 text-slate-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-slate-500">
                  Mengetik...
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-3">
            {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Tulis pertanyaan kamu..."
                rows={2}
                className="min-h-[44px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-400"
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    event.currentTarget.form?.requestSubmit()
                  }
                }}
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </section>
      )}
    </>
  )
}