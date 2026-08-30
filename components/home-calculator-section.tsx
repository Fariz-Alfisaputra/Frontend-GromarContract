'use client'

import { useRouter } from 'next/navigation'
import { B2BCalculator } from '@/components/dashboard/b2b-calculator'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/use-translation'

export function HomeCalculatorSection() {
  const router = useRouter()
  const { t } = useTranslation()

  const handleSelect = (name: string, volume: string, price: string) => {
    // Navigate to contract marketplace to complete contract request
    router.push('/contract')
  }

  return (
    <section id="calculator" className="scroll-mt-24 bg-background py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <ScrollReveal direction="up" distance={30}>
          <div className="mx-auto max-w-3xl text-center mb-10">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              {String(t('calculatorSection.eyebrow'))}
            </span>
            <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {String(t('calculatorSection.title'))}
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              {String(t('calculatorSection.subtitle'))}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" distance={40} delay={0.2}>
          <B2BCalculator onSelectCommodity={handleSelect} />
        </ScrollReveal>
      </div>
    </section>
  )
}
