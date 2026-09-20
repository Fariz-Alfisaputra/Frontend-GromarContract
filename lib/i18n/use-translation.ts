'use client'

import { useLanguage } from '@/lib/i18n/provider'

export interface Translation {
  t: (key: string) => string | string[]
  locale: 'id' | 'en'
  setLocale: (next: 'id' | 'en') => void
  isId: boolean
  isEn: boolean
  isTransitioning: boolean
}

export function useTranslation(): Translation {
  const { t, locale, setLocale, isId, isTransitioning } = useLanguage()
  return {
    t,
    locale,
    setLocale,
    isId,
    isEn: locale === 'en',
    isTransitioning,
  }
}
