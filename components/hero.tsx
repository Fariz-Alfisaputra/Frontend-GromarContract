'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Store, PlayCircle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  // Scroll animations for depth/parallax & fade out on scroll down
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const textY = useTransform(scrollYProgress, [0, 1], ['0px', '120px'])
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const statScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.9])

  return (
    <section
      ref={containerRef}
      id="home"
      className="relative isolate min-h-[100svh] overflow-hidden"
    >
      {/* Parallax Cinematic background */}
      <motion.div
        className="absolute inset-0 -z-20 origin-center"
        style={{ y: bgY, scale: bgScale }}
      >
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: 'url(/coastline.png)' }}
        />
      </motion.div>

      {/* Themed gradient + darkening overlay */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0c3b1e]/85 via-[#0b2f3a]/65 to-[#0a2f5e]/85"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-transparent to-transparent"
        aria-hidden="true"
      />

      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-5 py-32 text-center sm:px-8"
      >
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md"
        >
          <ShieldCheck className="h-4 w-4" />
          Transparent contracts · Agro &amp; Marine · Launching 2026
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-7 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          Growing Trust Between{' '}
          <span className="animated-gradient-text">Land &amp; Sea</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/85 sm:text-xl"
        >
          GROMAR Contract connects farmers and fishermen with restaurants,
          hotels and distributors through transparent smart contracts securing
          fair prices before harvest and guaranteed supply before catch.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-9 flex flex-col gap-3 sm:flex-row"
        >
          <Button
            asChild
            className="group h-13 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-black/20 transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
          >
            <Link href="/shop">
              <Store className="mr-1 h-5 w-5" />
              Enter Marketplace
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="group h-13 rounded-full border-white/40 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur-md transition-transform hover:-translate-y-0.5 hover:bg-white/20"
          >
            <Link href="/#how">
              <PlayCircle className="mr-1 h-5 w-5" />
              See how it works
            </Link>
          </Button>
        </motion.div>

        {/* Glass stat strip with scale on scroll */}
        <motion.dl
          style={{ scale: statScale }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-14 grid w-full max-w-2xl grid-cols-3 gap-4 rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md"
        >
          <div>
            <dt className="text-3xl font-extrabold text-white sm:text-4xl">12k+</dt>
            <dd className="mt-1 text-sm text-white/75">Producers onboard</dd>
          </div>
          <div className="border-x border-white/15">
            <dt className="text-3xl font-extrabold text-white sm:text-4xl">98%</dt>
            <dd className="mt-1 text-sm text-white/75">Contracts fulfilled</dd>
          </div>
          <div>
            <dt className="text-3xl font-extrabold text-white sm:text-4xl">0</dt>
            <dd className="mt-1 text-sm text-white/75">Hidden fees</dd>
          </div>
        </motion.dl>
      </motion.div>

      {/* Scroll hint with bounce animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{ opacity: textOpacity }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <div className="flex h-9 w-6 items-start justify-center rounded-full border-2 border-white/50 p-1.5">
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="h-2 w-1 rounded-full bg-white/80"
          />
        </div>
      </motion.div>
    </section>
  )
}
