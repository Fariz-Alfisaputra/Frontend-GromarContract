'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { Bot, Send, Sparkles, X } from 'lucide-react'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

function renderInlineMarkdown(text: string) {
  // Regex to match **bold**, *italic*, `code`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  const parts: (string | React.ReactNode)[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const token = match[0]
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      )
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic">
          {token.slice(1, -1)}
        </em>
      )
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="rounded bg-black/10 px-1 py-0.5 font-mono text-xs">
          {token.slice(1, -1)}
        </code>
      )
    }
    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

function FormattedMessage({ content, isUser }: { content: string; isUser: boolean }) {
  if (isUser) {
    return <span className="whitespace-pre-wrap">{content}</span>
  }

  const lines = content.split('\n')

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) {
          return <div key={idx} className="h-1" />
        }

        // Bullet list item (- or *)
        if (/^[*-]\s+/.test(line)) {
          const text = line.replace(/^[*-]\s+/, '')
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-600 opacity-80" />
              <div className="flex-1">{renderInlineMarkdown(text)}</div>
            </div>
          )
        }

        // Numbered list item (1., 2., etc)
        const numberedMatch = line.match(/^(\d+\.)\s+(.*)/)
        if (numberedMatch) {
          const num = numberedMatch[1]
          const text = numberedMatch[2]
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5">
              <span className="min-w-[1.2rem] font-semibold text-emerald-700">{num}</span>
              <div className="flex-1">{renderInlineMarkdown(text)}</div>
            </div>
          )
        }

        return (
          <p key={idx} className="m-0 leading-relaxed">
            {renderInlineMarkdown(line)}
          </p>
        )
      })}
    </div>
  )
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
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, open, loading])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const handleToggleOpen = (nextOpen: boolean) => {
    if (!nextOpen && loading) {
      abortControllerRef.current?.abort()
    }
    setOpen(nextOpen)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmed = input.trim()
    if (!trimmed || loading) return

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    setError('')

    // Abort previous in-flight request if any
    abortControllerRef.current?.abort()
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('gromar_token') : null

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: nextMessages }),
        signal: abortController.signal,
      })

      if (!response.ok) {
        let errorMsg = 'Gagal mengirim pesan'
        try {
          const data = await response.json()
          if (data.error || data.message) {
            errorMsg = data.error || data.message
          }
        } catch {
          // not JSON
        }
        throw new Error(errorMsg)
      }

      if (!response.body) {
        throw new Error('Response body tidak tersedia')
      }

      // Add placeholder for streaming assistant response
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      let fullAssistantText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        // Keep incomplete event in buffer
        buffer = events.pop() || ''

        for (const event of events) {
          const lines = event.split('\n')
          for (const line of lines) {
            const trimmedLine = line.trim()
            if (trimmedLine.startsWith('data: ')) {
              const dataStr = trimmedLine.slice(6).trim()
              if (dataStr === '[DONE]') {
                break
              }
              try {
                const parsed = JSON.parse(dataStr)
                if (parsed.text) {
                  fullAssistantText += parsed.text
                  setMessages((prev) => {
                    const updated = [...prev]
                    const lastIndex = updated.length - 1
                    if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
                      updated[lastIndex] = {
                        ...updated[lastIndex],
                        content: fullAssistantText,
                      }
                    }
                    return updated
                  })
                } else if (parsed.error) {
                  throw new Error(parsed.error)
                }
              } catch (parseErr) {
                if (parseErr instanceof Error && parseErr.message !== 'Unexpected token') {
                  throw parseErr
                }
              }
            }
          }
        }
      }

      // If nothing was streamed, provide a fallback
      if (!fullAssistantText.trim()) {
        setMessages((prev) => {
          const updated = [...prev]
          const lastIndex = updated.length - 1
          if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: 'Maaf, saya belum punya jawaban untuk itu.',
            }
          }
          return updated
        })
      }
    } catch (chatError) {
      if (chatError instanceof Error && chatError.name === 'AbortError') {
        return
      }
      const message = chatError instanceof Error ? chatError.message : 'Terjadi kesalahan'
      setError(message)
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => handleToggleOpen(!open)}
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
              onClick={() => handleToggleOpen(false)}
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
                  <FormattedMessage content={message.content} isUser={message.role === 'user'} />
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