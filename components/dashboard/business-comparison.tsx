'use client'

import { Check, X, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { TopographicLines } from '@/components/ui/topographic-lines'
import { useTranslation } from '@/lib/i18n/use-translation'

export function BusinessComparison() {
  const { t } = useTranslation()

  const COMPARISONS = [
    {
      feature: String(t('comparison.rows.r1.feature')),
      traditional: String(t('comparison.rows.r1.traditional')),
      gromar: String(t('comparison.rows.r1.gromar')),
      gromarWin: true,
    },
    {
      feature: String(t('comparison.rows.r2.feature')),
      traditional: String(t('comparison.rows.r2.traditional')),
      gromar: String(t('comparison.rows.r2.gromar')),
      gromarWin: true,
    },
    {
      feature: String(t('comparison.rows.r3.feature')),
      traditional: String(t('comparison.rows.r3.traditional')),
      gromar: String(t('comparison.rows.r3.gromar')),
      gromarWin: true,
    },
    {
      feature: String(t('comparison.rows.r4.feature')),
      traditional: String(t('comparison.rows.r4.traditional')),
      gromar: String(t('comparison.rows.r4.gromar')),
      gromarWin: true,
    },
    {
      feature: String(t('comparison.rows.r5.feature')),
      traditional: String(t('comparison.rows.r5.traditional')),
      gromar: String(t('comparison.rows.r5.gromar')),
      gromarWin: true,
    },
  ]

  return (
    <section className="relative overflow-hidden my-14 py-10 sm:py-16 bg-agro-soft">
      <TopographicLines color="oklch(0.55 0.13 149)" opacity={0.22} />
      <div className="pointer-events-none absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-grain/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-marine/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">
        <div className="rounded-3xl border border-agro/20 bg-card/80 p-6 shadow-xl shadow-agro/10 backdrop-blur-xl sm:p-10">
          <ScrollReveal direction="up" distance={30}>
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <Sparkles className="h-3.5 w-3.5" /> {String(t('comparison.badge'))}
              </span>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {String(t('comparison.title'))}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {String(t('comparison.subtitle'))}
              </p>
            </div>
          </ScrollReveal>

          {/* Comparison Table */}
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-4 px-4 text-xs font-bold uppercase text-muted-foreground w-1/4">
                    {String(t('comparison.aspect'))}
                  </th>
                  <th className="py-4 px-4 text-xs font-bold uppercase text-muted-foreground w-3/8 bg-secondary/30 rounded-t-2xl">
                    {String(t('comparison.traditional'))}
                  </th>
                  <th className="py-4 px-4 text-xs font-bold uppercase text-primary w-3/8 bg-primary/10 rounded-t-2xl">
                    <span className="flex items-center gap-1.5 font-extrabold">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      {String(t('comparison.gromar'))}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {COMPARISONS.map((row) => (
                  <tr key={row.feature} className="transition-colors hover:bg-secondary/40">
                    <td className="py-4 px-4 text-sm font-bold text-foreground">
                      {row.feature}
                    </td>
                    <td className="py-4 px-4 text-xs text-muted-foreground bg-secondary/10">
                      <div className="flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 mt-0.5">
                          <X className="h-3 w-3" />
                        </span>
                        <span>{row.traditional}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-medium text-foreground bg-primary/5">
                      <div className="flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mt-0.5">
                          <Check className="h-3 w-3" />
                        </span>
                        <span className="font-semibold">{row.gromar}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
