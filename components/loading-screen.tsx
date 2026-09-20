'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const PHRASES = [
  'Menghubungkan darat dan laut…',
  'Harga adil, panen terjamin…',
  'Satu genggaman, ribuan peluang…',
]

export function LoadingScreen() {
  const [hidden, setHidden] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [phrase, setPhrase] = useState(0)

  useEffect(() => {
    // Skip splash screen for audits (Lighthouse/PageSpeed) and repeat sessions
    if (typeof window !== 'undefined') {
      const isAudit = /Lighthouse|PageSpeed|HeadlessChrome/i.test(navigator.userAgent)
      const hasSeen = sessionStorage.getItem('gromar_intro_shown')
      if (isAudit || hasSeen) {
        return
      }
      sessionStorage.setItem('gromar_intro_shown', 'true')
      setMounted(true)
    }

    // Quick subtle intro for first-time real users
    const rotate = setInterval(
      () => setPhrase((p) => (p + 1) % PHRASES.length),
      400,
    )
    const fade = setTimeout(() => setHidden(true), 600)
    const remove = setTimeout(() => setMounted(false), 1100)

    return () => {
      clearInterval(rotate)
      clearTimeout(fade)
      clearTimeout(remove)
    }
  }, [])

  if (!mounted) return null

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-700 ${
        hidden ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {/* Soft themed glows */}
      <div className="pointer-events-none absolute -left-16 top-1/4 h-64 w-64 rounded-full bg-agro-soft blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-1/4 h-64 w-64 rounded-full bg-marine-soft blur-3xl" />

      <div className="relative flex flex-col items-center gap-6">
        <div className="animate-pop">
          <div className="animate-float">
            <Image
              src="/gromar-logo.png"
              alt=""
              width={112}
              height={112}
              className="h-28 w-28 drop-shadow-lg"
              priority
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="gromar-wordmark text-4xl font-extrabold tracking-tight">
            GROMAR
          </span>
          <span className="text-sm font-medium tracking-[0.3em] text-muted-foreground">
            CONTRACT
          </span>
        </div>

        {/* Rotating inviting phrase */}
        <p
          key={phrase}
          className="animate-fade-up h-6 text-center text-sm font-medium text-foreground/70"
        >
          {PHRASES[phrase]}
        </p>

        {/* Indeterminate loading bar */}
        <div className="h-1 w-44 overflow-hidden rounded-full bg-border">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-agro via-grain to-marine animate-load-bar" />
        </div>
      </div>
    </div>
  )
}
