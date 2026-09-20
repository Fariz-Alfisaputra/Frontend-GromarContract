'use client'

import { useState, useRef, useEffect } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { useLanguage, type Locale } from '@/lib/i18n/provider'

const locales: { code: Locale; label: string; flag: string }[] = [
  { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

export function LanguageSwitcher({ variant = 'solid' }: { variant?: 'overlay' | 'solid' | 'overlay-auto' | 'solid-top' }) {
  const { locale, setLocale, isTransitioning } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = locales.find((l) => l.code === locale) ?? locales[0]

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isTransitioning}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-all hover:bg-white/15 disabled:opacity-50"
        aria-label="Change language"
      >
        <Globe size={16} />
        <span>{current.flag}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-2xl border border-border bg-background shadow-xl z-[60] animate-in fade-in slide-in-from-top-2 duration-150">
          {locales.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLocale(l.code)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors ${
                locale === l.code
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-secondary'
              }`}
            >
              <span className="text-lg">{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Compact mobile language toggle
 */
export function LanguageToggle() {
  const { locale, setLocale, isTransitioning } = useLanguage()
  const next: Locale = locale === 'id' ? 'en' : 'id'
  const flag = locale === 'id' ? '🇮🇩' : '🇬🇧'

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      disabled={isTransitioning}
      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold transition-all hover:bg-secondary disabled:opacity-50 w-full"
    >
      <span className="text-lg">{flag}</span>
      <span>{locale === 'id' ? 'Indonesia' : 'English'}</span>
      <span className="ml-auto text-xs text-muted-foreground">→ {next === 'id' ? '🇮🇩' : '🇬🇧'}</span>
    </button>
  )
}
