import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

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

    // Proxy to Express backend as a stream without buffering
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const authHeader = request.headers.get('authorization')

    const backendRes = await fetch(`${backendUrl.replace(/\/$/, '')}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify({ messages: cleanedMessages }),
      signal: request.signal,
    })

    if (!backendRes.ok || !backendRes.body) {
      let errorMessage = 'Gagal mendapatkan respons dari server.'
      try {
        const errJson = await backendRes.json()
        if (errJson.message || errJson.error) {
          errorMessage = errJson.message || errJson.error
        }
      } catch {
        // Not a JSON response
      }
      return NextResponse.json({ error: errorMessage }, { status: backendRes.status })
    }

    // Return backend stream directly
    return new Response(backendRes.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return new Response(null, { status: 499 })
    }
    console.error('[api/chat] error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses chat.' },
      { status: 500 }
    )
  }
}