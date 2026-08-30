'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'
import { useCartStore } from '@/lib/store/cart'
import { useIdleTimeout } from '@/hooks/useIdleTimeout'
import { SessionTimeoutModal } from '@/components/session-timeout-modal'
import { useTranslation } from '@/lib/i18n/use-translation'
import { toast } from 'sonner'

/**
 * AuthGuard:
 * - Memvalidasi token (checkAuth) saat app dimuat, sehingga token yang expired
 *   langsung dianggap tidak login sejak awal.
 * - Menerapkan idle timeout (auto-logout) untuk pengguna yang sudah login.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const clearLocal = useCartStore((s) => s.clearLocal)
  const { t } = useTranslation()

  // Cek token saat pertama kali app dimuat (hanya sekali)
  const checkAuth = useAuthStore((s) => s.checkAuth)
  const checkedRef = useRef(false)

  useEffect(() => {
    if (checkedRef.current) return
    checkedRef.current = true
    checkAuth()
  }, [checkAuth])

  const isLoggedIn = Boolean(user && token)
  const isLoginOrRegisterPage =
    pathname === '/login' || pathname === '/register'

  const handleTimeout = () => {
    // Bersihkan cart lokal lalu logout
    clearLocal()
    useAuthStore.getState().logout()
    toast.info(String(t('session.timeoutMessage')))
    window.location.href = '/login'
  }

  const { showWarning, secondsLeft, resetTimer } = useIdleTimeout({
    enabled: isLoggedIn && !isLoginOrRegisterPage,
    onTimeout: handleTimeout,
  })

  return (
    <>
      {children}
      {showWarning && (
        <SessionTimeoutModal secondsLeft={secondsLeft} onStay={resetTimer} />
      )}
    </>
  )
}
