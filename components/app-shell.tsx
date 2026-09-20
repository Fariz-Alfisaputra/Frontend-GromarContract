'use client'

import { LanguageProvider } from '@/lib/i18n/provider'
import { AgroMarineTransition } from '@/components/agro-marine-transition'
import { AuthGuard } from '@/components/auth-guard'

/**
 * Root client shell — provides LanguageProvider, agro-marine transition,
 * and AuthGuard (session validation + idle timeout) for the entire app.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AgroMarineTransition />
      <AuthGuard>
        {children}
      </AuthGuard>
    </LanguageProvider>
  )
}
