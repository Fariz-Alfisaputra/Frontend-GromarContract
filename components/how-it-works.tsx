'use client'

import { Handshake, Lock, CheckSquare, Coins, Database } from 'lucide-react'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/use-translation'

export function HowItWorks() {
  const { t } = useTranslation()

  const steps = [
    {
      icon: Handshake,
      title: String(t('how.steps.s1.title')),
      body: String(t('how.steps.s1.body')),
    },
    {
      icon: Lock,
      title: String(t('how.steps.s2.title')),
      body: String(t('how.steps.s2.body')),
    },
    {
      icon: CheckSquare,
      title: String(t('how.steps.s3.title')),
      body: String(t('how.steps.s3.body')),
    },
    {
      icon: Coins,
      title: String(t('how.steps.s4.title')),
      body: String(t('how.steps.s4.body')),
    },
    {
      icon: Database,
      title: String(t('how.steps.s5.title')),
      body: String(t('how.steps.s5.body')),
    },
  ]

  return (
    <section id="how" className="scroll-mt-20 bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <ScrollReveal direction="up" distance={30}>
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              {String(t('how.eyebrow'))}
            </span>
            <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {String(t('how.title'))}
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              {String(t('how.subtitle'))}
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer staggerDelay={0.15} className="mt-14 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {steps.map((step, i) => {
            const Icon = step.icon
            const accent = i % 2 === 0 ? 'agro' : 'marine'
            return (
              <StaggerItem key={step.title}>
                <li className="relative flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                  <div
                    className={
                      accent === 'agro'
                        ? 'flex h-12 w-12 items-center justify-center rounded-2xl bg-agro-soft text-agro'
                        : 'flex h-12 w-12 items-center justify-center rounded-2xl bg-marine-soft text-marine'
                    }
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="mt-5 text-sm font-semibold text-muted-foreground">
                    {String(t('how.stepLabel')).replace('{n}', String(i + 1))}
                  </span>
                  <h3 className="mt-1 text-base font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </li>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      </div>
    </section>
  )
}
