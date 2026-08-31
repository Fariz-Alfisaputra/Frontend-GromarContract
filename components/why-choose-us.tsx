'use client'

import { ShieldCheck, CreditCard, Truck, Tag } from 'lucide-react'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/use-translation'

const ICONS = [ShieldCheck, CreditCard, Truck, Tag]
const ICON_COLORS = [
  'bg-agro-soft text-agro',
  'bg-marine-soft text-marine',
  'bg-grain/20 text-foreground',
  'bg-agro-soft text-agro',
]

export function WhyChooseUs() {
  const { t } = useTranslation()

  const items = ['w1', 'w2', 'w3', 'w4'].map((key) => ({
    title: String(t(`whyChooseUs.items.${key}.title`)),
    body: String(t(`whyChooseUs.items.${key}.body`)),
  }))

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <ScrollReveal direction="up" distance={30}>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              {String(t('whyChooseUs.eyebrow'))}
            </span>
            <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {String(t('whyChooseUs.title'))}
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              {String(t('whyChooseUs.subtitle'))}
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer staggerDelay={0.1} className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = ICONS[i]
            return (
              <StaggerItem key={item.title}>
                <article className="flex flex-col rounded-3xl border border-border bg-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${ICON_COLORS[i]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
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
