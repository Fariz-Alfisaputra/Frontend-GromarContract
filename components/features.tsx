'use client'

import {
  FileSignature,
  Lock,
  Snowflake,
  LineChart,
  Scale,
  Network,
} from 'lucide-react'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/use-translation'

export function Features() {
  const { t } = useTranslation()

  const features = [
    {
      icon: FileSignature,
      accent: 'agro',
      title: String(t('features.items.f1.title')),
      body: String(t('features.items.f1.body')),
    },
    {
      icon: Lock,
      accent: 'marine',
      title: String(t('features.items.f2.title')),
      body: String(t('features.items.f2.body')),
    },
    {
      icon: Snowflake,
      accent: 'marine',
      title: String(t('features.items.f3.title')),
      body: String(t('features.items.f3.body')),
    },
    {
      icon: LineChart,
      accent: 'agro',
      title: String(t('features.items.f4.title')),
      body: String(t('features.items.f4.body')),
    },
    {
      icon: Scale,
      accent: 'grain',
      title: String(t('features.items.f5.title')),
      body: String(t('features.items.f5.body')),
    },
    {
      icon: Network,
      accent: 'agro',
      title: String(t('features.items.f6.title')),
      body: String(t('features.items.f6.body')),
    },
  ]

  return (
    <section id="features" className="scroll-mt-20 bg-background">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <ScrollReveal direction="up" distance={30}>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              {String(t('features.eyebrow'))}
            </span>
            <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {String(t('features.title'))}
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              {String(t('features.subtitle'))}
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer staggerDelay={0.12} className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body, accent }) => {
            const iconClass =
              accent === 'agro'
                ? 'bg-agro-soft text-agro'
                : accent === 'marine'
                  ? 'bg-marine-soft text-marine'
                  : 'bg-grain/20 text-foreground'
            return (
              <StaggerItem key={title}>
                <article
                  className="group flex flex-col rounded-3xl border border-border bg-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${iconClass}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </article>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      </div>
    </section>
  )
}
