import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { CUSTOMER_SERVICE_SYSTEM_PROMPT } from '@/lib/knowledge-base'

export const runtime = 'nodejs'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 }
      )
    }

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
  } catch (error) {
    console.error('[api/chat] error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses chat.' },
      { status: 500 }
    )
  }
}