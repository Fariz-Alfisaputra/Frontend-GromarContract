'use client'

import { AlarmClock, LogIn } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/use-translation'

interface SessionTimeoutModalProps {
  secondsLeft: number
  onStay: () => void
}

export function SessionTimeoutModal({ secondsLeft, onStay }: SessionTimeoutModalProps) {
  const { t } = useTranslation()

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
    >
      <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlarmClock size={28} />
          </div>

          <h2
            id="session-timeout-title"
            className="text-lg font-bold text-foreground"
          >
            {String(t('session.title'))}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {String(t('session.subtitle'))}
          </p>

          <div className="mt-4 flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-muted text-3xl font-extrabold tabular-nums text-destructive">
            {secondsLeft}
          </div>
          <span className="mt-1 text-xs text-muted-foreground">{String(t('session.seconds'))}</span>

          <p className="mt-3 text-xs text-muted-foreground">
            {String(t('session.hint'))}
          </p>

          <button
            type="button"
            onClick={onStay}
            className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/50 active:translate-y-px"
          >
            <LogIn size={16} />
            {String(t('session.stayButton'))}
          </button>
        </div>
      </div>
    </div>
  )
}
