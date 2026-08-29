'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

export function CTA() {
  return (
    <section id="contact" className="bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
        <ScrollReveal direction="up" scale={0.97} distance={30}>
          <div className="overflow-hidden rounded-4xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl">
            <div className="grid items-center gap-10 p-10 sm:p-14 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  Ready to secure your next harvest or catch?
                </h2>
                <p className="mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
                  Join the producers and buyers building a transparent supply chain
                  across agriculture and marine — before the season even begins.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    className="group h-12 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    <Link href="/contract">
                      Get Started
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 rounded-full border-border px-7 text-base font-semibold"
                  >
                    Talk to our team
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-agro-soft p-6 transition-transform duration-300 hover:scale-105">
                  <p className="text-3xl font-extrabold text-agro">Agro</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Markets locked in before harvest.
                  </p>
                </div>
                <div className="mt-6 rounded-3xl bg-marine-soft p-6 transition-transform duration-300 hover:scale-105">
                  <p className="text-3xl font-extrabold text-marine">Marine</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Buyers ready before the catch.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
