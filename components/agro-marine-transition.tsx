'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/provider'

/**
 * Fullscreen agro-marine transition overlay.
 * Automatically renders when locale changes (reads isTransitioning from context).
 * Shows a wave → farmland morph animation.
 * Duration: ~1.3s (matches the language provider transition delay).
 */
export function AgroMarineTransition() {
  const { isTransitioning } = useLanguage()
  const [mounted, setMounted] = useState(isTransitioning)

  useEffect(() => {
    if (isTransitioning) setMounted(true)
  }, [isTransitioning])

  if (!mounted) return null

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          key="agro-marine-overlay"
          className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background scrim */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <svg
              viewBox="0 0 1600 900"
              className="h-full w-full"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Ocean-to-land gradient */}
                <linearGradient id="agroGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0F3A78" />
                  <stop offset="40%" stopColor="#1565C0" />
                  <stop offset="70%" stopColor="#2E7D32" />
                  <stop offset="100%" stopColor="#48A600" />
                </linearGradient>
                <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1565C0" />
                  <stop offset="50%" stopColor="#2E7D32" />
                  <stop offset="100%" stopColor="#48A600" />
                </linearGradient>
                <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFC107" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#FFC107" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Base ocean */}
              <motion.rect
                x="0" y="0" width="1600" height="900"
                fill="url(#agroGrad)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              />

              {/* Wave 1 — main ocean wave sweeping up */}
              <motion.path
                d="M0 900 Q200 750 400 800 Q600 850 800 780 Q1000 710 1200 770 Q1400 830 1600 760 L1600 900 Z"
                fill="#1565C0"
                fillOpacity="0.7"
                initial={{ y: 300 }}
                animate={{ y: -200 }}
                transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Wave 2 — secondary wave with offset */}
              <motion.path
                d="M0 880 Q300 800 500 850 Q700 900 900 830 Q1100 760 1300 820 Q1500 880 1600 810 L1600 900 Z"
                fill="#2E7D32"
                fillOpacity="0.5"
                initial={{ y: 250 }}
                animate={{ y: -150 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              />

              {/* Farm rows (appearing as wave recedes) */}
              <motion.g
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <g key={i}>
                    <motion.rect
                      x={100 + i * 280}
                      y={620 + i * 20}
                      width={200}
                      height={6}
                      rx={3}
                      fill="#48A600"
                      fillOpacity={0.6}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 + i * 0.08 }}
                      style={{ originX: '50%' }}
                    />
                    {/* Wheat stalks */}
                    {[0, 1, 2].map((j) => (
                      <motion.line
                        key={j}
                        x1={130 + i * 280 + j * 50}
                        y1={620 + i * 20}
                        x2={130 + i * 280 + j * 50}
                        y2={580 + i * 20}
                        stroke="#FFC107"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.4, delay: 0.7 + i * 0.08 + j * 0.05 }}
                        style={{ originY: '100%' }}
                      />
                    ))}
                  </g>
                ))}
              </motion.g>

              {/* Sparkle particles along the wave edge */}
              {Array.from({ length: 18 }).map((_, i) => {
                const x = 80 + (i * 1440) / 17
                const baseY = 750 - (i % 3) * 30
                const delay = 0.3 + (i * 0.06)
                return (
                  <motion.circle
                    key={i}
                    cx={x}
                    cy={baseY}
                    r={2 + (i % 3)}
                    fill="#FFC107"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      scale: [0, 1.5, 1, 0],
                      y: baseY - 40,
                    }}
                    transition={{
                      duration: 1.0,
                      delay,
                      ease: 'easeOut',
                    }}
                  />
                )
              })}

              {/* Central glow pulse */}
              <motion.circle
                cx="800"
                cy="450"
                r="200"
                fill="url(#glowGrad)"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: [0.3, 1.2, 0.9], opacity: [0, 0.8, 0] }}
                transition={{ duration: 1.2, delay: 0.2 }}
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
