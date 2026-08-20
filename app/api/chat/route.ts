import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { CUSTOMER_SERVICE_SYSTEM_PROMPT } from '@/lib/knowledge-base'

export const runtime = 'nodejs'

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type RateLimitEntry = {
  count: number
  resetAt: number
}

const WINDOW_MS = 60_000
const MAX_REQUESTS = 8
const rateLimitStore = new Map<string, RateLimitEntry>()

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }

  const realIp = request.headers.get('x-real-ip')
  return realIp?.trim() || 'unknown'
}

function isRateLimited(ip: string) {
  const now = Date.now()
  const current = rateLimitStore.get(ip)

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  if (current.count >= MAX_REQUESTS) {
    return true
  }

  current.count += 1
  rateLimitStore.set(ip, current)
  return false
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Terlalu banyak request. Coba lagi sebentar.' },
        { status: 429 }
      )
    }

    const body = (await request.json()) as { messages?: ChatMessage[] }
    const messages = Array.isArray(body.messages) ? body.messages : []

    const cleanedMessages = messages
      .filter(
        (message): message is ChatMessage =>
          Boolean(message) &&
          (message.role === 'user' || message.role === 'assistant') &&
          typeof message.content === 'string' &&
          message.content.trim().length > 0
      )
      .map((message) => ({
        role: message.role,
        content: message.content.trim(),
      }))

    if (cleanedMessages.length === 0) {
      return NextResponse.json(
        { error: 'messages wajib diisi' },
        { status: 400 }
      )
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const omniBaseUrl = process.env.OMNIROUTE_BASE_URL || 'http://localhost:20128/v1'
    const omniApiKey = process.env.OMNIROUTE_API_KEY
    const omniModel = process.env.OMNIROUTE_MODEL || 'claude-sonnet-4-6'

    // 1. If OmniRoute API key is explicitly configured in local environment
    if (omniApiKey) {
      const response = await fetch(`${omniBaseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${omniApiKey}`,
        },
        body: JSON.stringify({
          model: omniModel,
          messages: [
            { role: 'system', content: CUSTOMER_SERVICE_SYSTEM_PROMPT },
            ...cleanedMessages,
          ],
          max_tokens: 500,
        }),
      })

      if (response.ok) {
        const responseText = await response.text()
        let reply = ''
        try {
          const json = JSON.parse(responseText)
          reply = json.choices?.[0]?.message?.content || json.choices?.[0]?.delta?.content || ''
        } catch {
          // parse SSE fallback if stream chunk
          const lines = responseText.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6))
                reply += data.choices?.[0]?.delta?.content || ''
              } catch {
                // ignore
              }
            }
          }
        }
        return NextResponse.json({ reply: reply.trim() || 'Maaf, saya belum bisa menjawab itu.' })
      }
    }

    // 2. Forward chat request to Express Backend Server (Backend manages OmniRoute/AI)
    try {
      const backendRes = await fetch(`${backendUrl.replace(/\/$/, '')}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: cleanedMessages }),
      })

      if (backendRes.ok) {
        const data = await backendRes.json()
        if (data.reply) {
          return NextResponse.json({ reply: data.reply })
        }
      }
    } catch {
      // Backend route pending
    }

    // 3. Fallback to Anthropic API if ANTHROPIC_API_KEY is configured
    if (anthropic && process.env.ANTHROPIC_API_KEY) {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: CUSTOMER_SERVICE_SYSTEM_PROMPT,
        messages: cleanedMessages,
      })

      const reply = response.content
        .filter((block): block is { type: 'text'; text: string } => block.type === 'text')
        .map((block) => block.text)
        .join('')

      return NextResponse.json({ reply: reply || 'Maaf, saya belum bisa menjawab itu.' })
    }

    return NextResponse.json({
      reply: 'Layanan chat terhubung ke server backend.',
    })
  } catch (error) {
    console.error('[api/chat] error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses chat.' },
      { status: 500 }
    )
  }
}