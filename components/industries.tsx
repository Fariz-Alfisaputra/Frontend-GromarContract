'use client'

import Image from 'next/image'
import { ArrowRight, Sprout, Waves } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/use-translation'

export function Industries() {
  const { t } = useTranslation()
  return (
    <section id="marketplace" className="bg-secondary overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <ScrollReveal direction="up" distance={40}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {String(t('industries.title'))}
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              {String(t('industries.subtitle'))}
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {/* Agriculture — left */}
          <ScrollReveal direction="right" distance={50} delay={0.2}>
            <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="relative h-60 w-full overflow-hidden sm:h-72">
                <Image
                  src="/agriculture.png"
                  alt="Indonesian rice farmer standing in green terraced paddy fields"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-7 sm:p-8">
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-agro-soft px-3.5 py-1.5 text-sm font-semibold text-agro">
                  <Sprout className="h-4 w-4" />
                  {String(t('industries.agricultureBadge'))}
                </span>
                <h3 className="mt-5 text-2xl font-bold text-foreground">
                  {String(t('industries.agricultureTitle'))}
                </h3>
                <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                  {String(t('industries.agricultureBody'))}
                </p>
                <ul className="mt-6 space-y-3 text-sm text-foreground">
                  {(t('industries.agricultureList') as unknown as string[]).map(
                    (item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-agro/10 text-agro">
                        <ArrowRight className="h-3 w-3" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </ScrollReveal>

          {/* Marine — right */}
          <ScrollReveal direction="left" distance={50} delay={0.35}>
            <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="relative h-60 w-full overflow-hidden sm:h-72">
                <Image
                  src="/marine.png"
                  alt="Indonesian fisherman holding fresh fish on a wooden boat at sea"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-7 sm:p-8">
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-marine-soft px-3.5 py-1.5 text-sm font-semibold text-marine">
                  <Waves className="h-4 w-4" />
                  {String(t('industries.marineBadge'))}
                </span>
                <h3 className="mt-5 text-2xl font-bold text-foreground">
                  {String(t('industries.marineTitle'))}
                </h3>
                <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                  {String(t('industries.marineBody'))}
                </p>
                <ul className="mt-6 space-y-3 text-sm text-foreground">
                  {(t('industries.marineList') as unknown as string[]).map(
                    (item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-marine/10 text-marine">
                        <ArrowRight className="h-3 w-3" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
