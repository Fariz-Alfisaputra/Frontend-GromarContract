'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/use-translation'

export function FAQ() {
  const { t } = useTranslation()
  const [open, setOpen] = useState<number | null>(0)

  const faqs = [
    {
      q: String(t('faq.items.f1.q')),
      a: String(t('faq.items.f1.a')),
    },
    {
      q: String(t('faq.items.f2.q')),
      a: String(t('faq.items.f2.a')),
    },
    {
      q: String(t('faq.items.f3.q')),
      a: String(t('faq.items.f3.a')),
    },
    {
      q: String(t('faq.items.f4.q')),
      a: String(t('faq.items.f4.a')),
    },
    {
      q: String(t('faq.items.f5.q')),
      a: String(t('faq.items.f5.a')),
    },
  ]

  return (
    <section id="faq" className="scroll-mt-20 bg-secondary overflow-hidden">
      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
        <ScrollReveal direction="up" distance={30}>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              {String(t('faq.eyebrow'))}
            </span>
            <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {String(t('faq.title'))}
            </h2>
          </div>
        </ScrollReveal>

        <StaggerContainer staggerDelay={0.1} className="mt-12 space-y-4">
          {faqs.map((item, i) => {
            const isOpen = open === i
            return (
              <StaggerItem key={item.q}>
                <div
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-semibold text-foreground">
                      {item.q}
                    </span>
                    <Plus
                      className={`h-5 w-5 shrink-0 text-primary transition-transform duration-300 ${
                        isOpen ? 'rotate-45' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      </div>
    </section>
  )
}
