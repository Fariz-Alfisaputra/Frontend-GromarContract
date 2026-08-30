'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/provider'
import { id as idDict } from '@/lib/i18n/translations/id'
import { en as enDict } from '@/lib/i18n/translations/en'

/**
 * Fullscreen agro-marine transition overlay.
 * Automatically renders when locale changes (reads isTransitioning from context).
 * Shows an ocean wave animation with scattered photos of the products we sell.
 * Duration: ~2s (matches the language provider transition delay).
 */

const PRODUCTS = [
  {
    src: '/agri-rice.png',
    label: 'Premium Rice',
    left: '20%',
    top: '14%',
    rotate: -6,
    size: 'h-36 w-36 sm:h-48 sm:w-48',
    delay: 0.15,
  },
  {
    src: '/agri-coffee.png',
    label: 'Arabica Coffee',
    left: '78%',
    top: '18%',
    rotate: 5,
    size: 'h-32 w-32 sm:h-40 sm:w-40',
    delay: 0.28,
  },
  {
    src: '/marine-fish.png',
    label: 'Fresh Seafood',
    left: '16%',
    top: '66%',
    rotate: 4,
    size: 'h-32 w-32 sm:h-40 sm:w-40',
    delay: 0.4,
  },
  {
    src: '/marine-shrimp.png',
    label: 'Wild-Caught Shrimp',
    left: '74%',
    top: '64%',
    rotate: -5,
    size: 'h-36 w-36 sm:h-44 sm:w-44',
    delay: 0.52,
  },
]

const WAVES = [
  {
    d: 'M0 900 Q200 780 400 840 Q600 900 800 820 Q1000 740 1200 800 Q1400 860 1600 790 L1600 900 Z',
    foam: 'M0 900 Q200 780 400 840 Q600 900 800 820 Q1000 740 1200 800 Q1400 860 1600 790',
    fill: '#0D47A1',
    y: -220,
    duration: 1.1,
    delay: 0,
  },
  {
    d: 'M0 880 Q300 800 500 850 Q700 900 900 830 Q1100 760 1300 820 Q1500 880 1600 810 L1600 900 Z',
    foam: 'M0 880 Q300 800 500 850 Q700 900 900 830 Q1100 760 1300 820 Q1500 880 1600 810',
    fill: '#1565C0',
    y: -160,
    duration: 1.2,
    delay: 0.05,
  },
  {
    d: 'M0 860 Q400 920 700 850 Q1000 780 1300 850 Q1450 880 1600 840 L1600 900 Z',
    foam: 'M0 860 Q400 920 700 850 Q1000 780 1300 850 Q1450 880 1600 840',
    fill: '#1E88E5',
    y: -110,
    duration: 1.3,
    delay: 0.08,
  },
]
export function AgroMarineTransition() {
  const { isTransitioning, pendingLocale } = useLanguage()
  const [mounted, setMounted] = useState(isTransitioning)

  useEffect(() => {
    if (isTransitioning) setMounted(true)
  }, [isTransitioning])

  const targetDict = pendingLocale === 'en' ? enDict : idDict
  const transitionBlock = targetDict.transition as
    | Record<string, string>
    | undefined
  const welcome = transitionBlock?.welcome ?? 'Welcome!'
  const welcomeSub = transitionBlock?.welcomeSub ?? ''

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
                {/* Deep ocean gradient */}
                <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0A2E5C" />
                  <stop offset="45%" stopColor="#135093" />
                  <stop offset="100%" stopColor="#1E88E5" />
                </linearGradient>
              </defs>

              {/* Base ocean */}
              <motion.rect
                x="0"
                y="0"
                width="1600"
                height="900"
                fill="url(#oceanGrad)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              />

              {/* Rolling ocean waves */}
              {WAVES.map((w, i) => (
                <g key={i}>
                  <motion.path
                    d={w.d}
                    fill={w.fill}
                    fillOpacity="0.75"
                    initial={{ y: 300 + i * 60 }}
                    animate={{ y: w.y }}
                    transition={{
                      duration: w.duration,
                      ease: [0.22, 1, 0.36, 1],
                      delay: w.delay,
                    }}
                  />
                  <motion.path
                    d={w.foam}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeOpacity="0.3"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ y: 300 + i * 60 }}
                    animate={{ y: w.y }}
                    transition={{
                      duration: w.duration,
                      ease: [0.22, 1, 0.36, 1],
                      delay: w.delay,
                    }}
                  />
                </g>
              ))}
            </svg>
          </motion.div>

          {/* Scattered product photos */}
          <div className="absolute inset-0">
            {/* Badge */}
            <div className="absolute left-1/2 top-[6%] -translate-x-1/2">
              <span className="rounded-full bg-white/90 px-5 py-1.5 text-sm font-bold uppercase tracking-[0.25em] text-foreground shadow-lg backdrop-blur">
                Agro &amp; Marine
              </span>
            </div>

            {/* Welcome message */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
              <motion.h2
                initial={{ opacity: 0, y: 24, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)] sm:text-7xl"
              >
                {welcome}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="mt-4 max-w-2xl text-lg font-medium text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] sm:text-2xl"
              >
                {welcomeSub}
              </motion.p>
            </div>

            {PRODUCTS.map((p) => (
              <motion.div
                key={p.src}
                className="absolute"
                style={{ left: p.left, top: p.top }}
                initial={{ x: '-50%', opacity: 0, scale: 0.5, rotate: p.rotate - 10 }}
                animate={{
                  x: '-50%',
                  opacity: 1,
                  scale: 1,
                  rotate: p.rotate,
                  y: [10, -8, 10],
                }}
                transition={{
                  x: { duration: 0 },
                  opacity: { duration: 0.45, delay: p.delay },
                  scale: { duration: 0.45, delay: p.delay, ease: [0.22, 1, 0.36, 1] },
                  rotate: { duration: 0.45, delay: p.delay, ease: [0.22, 1, 0.36, 1] },
                  y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: p.delay },
                }}
              >
                <div className="rounded-2xl bg-white p-2 pb-3 shadow-2xl">
                  <Image
                    src={p.src}
                    alt={p.label}
                    width={240}
                    height={240}
                    className={`aspect-square ${p.size} rounded-xl object-cover`}
                  />
                  <p className="pt-2 text-center text-xs font-semibold leading-tight text-foreground sm:text-sm">
                    {p.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
