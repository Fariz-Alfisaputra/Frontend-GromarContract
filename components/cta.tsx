'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/use-translation'

export function CTA() {
  const { t } = useTranslation()
  return (
    <section id="contact" className="bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
        <ScrollReveal direction="up" scale={0.97} distance={30}>
          <div className="overflow-hidden rounded-4xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl">
            <div className="grid items-center gap-10 p-10 sm:p-14 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {String(t('cta.title'))}
                </h2>
                <p className="mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
                  {String(t('cta.subtitle'))}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    className="group h-12 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    <Link href="/contract">
                      {String(t('cta.getStarted'))}
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 rounded-full border-border px-7 text-base font-semibold"
                  >
                    {String(t('cta.talkToTeam'))}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-agro-soft p-6 transition-transform duration-300 hover:scale-105">
                  <p className="text-3xl font-extrabold text-agro">{String(t('cta.agro'))}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {String(t('cta.agroBody'))}
                  </p>
                </div>
                <div className="mt-6 rounded-3xl bg-marine-soft p-6 transition-transform duration-300 hover:scale-105">
                  <p className="text-3xl font-extrabold text-marine">{String(t('cta.marine'))}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {String(t('cta.marineBody'))}
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
