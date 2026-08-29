'use client'

import { Building2, Fish, Store, Truck, UtensilsCrossed, Wheat } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

const producers = [
  { icon: Wheat, label: 'Farmers' },
  { icon: Fish, label: 'Fishermen' },
]

const buyers = [
  { icon: UtensilsCrossed, label: 'Restaurants' },
  { icon: Building2, label: 'Hotels' },
  { icon: Store, label: 'Supermarkets' },
  { icon: Truck, label: 'Distributors' },
]

export function Audience() {
  return (
    <section className="bg-secondary overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <ScrollReveal direction="up" distance={30}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Built for everyone in the supply chain
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              One platform that guarantees market access for producers and reliable
              supply for buyers.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <ScrollReveal direction="right" distance={40} delay={0.2}>
            <div className="rounded-3xl border border-agro/20 bg-card p-8 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
              <h3 className="text-xl font-bold text-agro">Producers</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Guaranteed buyers and fair prices before you plant or set sail.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {producers.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-2xl bg-agro-soft px-4 py-4 transition-transform duration-200 hover:scale-105"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-agro text-agro-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-semibold text-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="left" distance={40} delay={0.35}>
            <div className="rounded-3xl border border-marine/20 bg-card p-8 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
              <h3 className="text-xl font-bold text-marine">Buyers</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Dependable supply and transparent sourcing, contract after contract.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {buyers.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-2xl bg-marine-soft px-4 py-4 transition-transform duration-200 hover:scale-105"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-marine text-marine-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-semibold text-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
