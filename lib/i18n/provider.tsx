'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { en } from '@/lib/i18n/translations/en'
import { id } from '@/lib/i18n/translations/id'
import type { Dictionary } from '@/lib/i18n/types'

export type Locale = 'id' | 'en'

interface LanguageContextValue {
  locale: Locale
  setLocale: (next: Locale) => void
  t: (key: string) => string | string[]
  isId: boolean
  isTransitioning: boolean
  pendingLocale: Locale | null
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = 'gromar_locale'

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'id'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'en' || stored === 'id' ? stored : 'id'
}

function lookup(dict: Dictionary, key: string): string | string[] {
  // Supports dot-notation: "navbar.home"
  let node: unknown = dict
  for (const part of key.split('.')) {
    if (node && typeof node === 'object' && part in (node as object)) {
      node = (node as Record<string, unknown>)[part]
    } else {
      return key
    }
  }
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node
  return key
}

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [locale, setLocaleState] = useState<Locale>(() => getInitialLocale())
  const [isTransitioning, setIsTransitioning] = useState(false)
  const pendingLocaleRef = useRef<Locale | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('lang', locale)
  }, [locale])

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return
      pendingLocaleRef.current = next
      setIsTransitioning(true)

      if (timerRef.current) clearTimeout(timerRef.current)
      // Duration matches the agro-marine transition (~2s)
      timerRef.current = setTimeout(() => {
        const nextLocale = pendingLocaleRef.current ?? next
        pendingLocaleRef.current = null
        setLocaleState(nextLocale)
        try {
          window.localStorage.setItem(STORAGE_KEY, nextLocale)
        } catch {
          // storage unavailable
        }
        setIsTransitioning(false)
      }, 2000)
    },
    [locale]
  )

  const dict = locale === 'en' ? en : id

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key: string) => lookup(dict, key),
      isId: locale === 'id',
      isTransitioning,
      pendingLocale: pendingLocaleRef.current,
    }),
    [locale, setLocale, dict, isTransitioning]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return ctx
}

export { LanguageContext }
