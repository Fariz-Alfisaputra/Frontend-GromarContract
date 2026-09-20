'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const IDLE_TIMEOUT_MS = 60 * 60 * 1000 // 1 jam tidak ada aktivitas
const WARNING_DURATION_MS = 60 * 1000 // peringatan muncul 60 detik sebelum habis

interface UseIdleTimeoutOptions {
  enabled: boolean
  timeout?: number // total idle sebelum auto-logout (ms)
  warningDuration?: number // durasi peringatan countdown sebelum logout (ms)
  onTimeout: () => void
}

interface UseIdleTimeoutResult {
  showWarning: boolean
  secondsLeft: number
  resetTimer: () => void
}

export function useIdleTimeout({
  enabled,
  timeout = IDLE_TIMEOUT_MS,
  warningDuration = WARNING_DURATION_MS,
  onTimeout,
}: UseIdleTimeoutOptions): UseIdleTimeoutResult {
  const [showWarning, setShowWarning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(
    Math.ceil(warningDuration / 1000)
  )

  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onTimeoutRef = useRef(onTimeout)
  const showWarningRef = useRef(showWarning)

  // Selalu simpan callback terbaru tanpa perlu mereset timer
  useEffect(() => {
    onTimeoutRef.current = onTimeout
  }, [onTimeout])

  useEffect(() => {
    showWarningRef.current = showWarning
  }, [showWarning])

  const clearAllTimers = useCallback(() => {
    if (idleRef.current) clearTimeout(idleRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
    idleRef.current = null
    countdownRef.current = null
  }, [])

  const resetTimer = useCallback(() => {
    if (!enabled) return
    clearAllTimers()
    setShowWarning(false)
    setSecondsLeft(Math.ceil(warningDuration / 1000))

    idleRef.current = setTimeout(() => {
      // Idle habis → mulai hitung mundur peringatan
      const deadline = Date.now() + warningDuration
      setShowWarning(true)
      setSecondsLeft(Math.ceil(warningDuration / 1000))

      countdownRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
        setSecondsLeft(remaining)
        if (remaining <= 0) {
          clearAllTimers()
          onTimeoutRef.current()
        }
      }, 200)
    }, timeout)
  }, [enabled, timeout, warningDuration, clearAllTimers])

  // Pasang / bongkar timer sesuai status `enabled`
  useEffect(() => {
    if (!enabled) {
      clearAllTimers()
      setShowWarning(false)
      return
    }

    resetTimer()
    return () => clearAllTimers()
  }, [enabled, resetTimer, clearAllTimers])

  // Dengarkan aktivitas user untuk mereset idle timer.
  // Saat peringatan sedang tampil, biarkan countdown berjalan — hanya tombol
  // "Tetap di Sini" (resetTimer eksplisit) yang dapat melanjutkan sesi.
  useEffect(() => {
    if (!enabled) return

    const activityEvents: (keyof WindowEventMap)[] = [
      'mousemove',
      'mousedown',
      'keydown',
      'click',
      'scroll',
      'touchstart',
    ]
    const handleActivity = () => {
      if (!showWarningRef.current) resetTimer()
    }

    activityEvents.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true })
    )

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      )
    }
  }, [enabled, resetTimer])

  return { showWarning, secondsLeft, resetTimer }
}
