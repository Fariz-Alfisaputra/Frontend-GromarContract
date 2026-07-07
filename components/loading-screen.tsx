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
  const [mounted, setMounted] = useState(true)
  const [phrase, setPhrase] = useState(0)

  useEffect(() => {
    // Rotate the inviting phrases while loading.
    const rotate = setInterval(
      () => setPhrase((p) => (p + 1) % PHRASES.length),
      700,
    )
    // Start fade-out, then unmount from the DOM.
    const fade = setTimeout(() => setHidden(true), 2100)
    const remove = setTimeout(() => setMounted(false), 2800)
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
