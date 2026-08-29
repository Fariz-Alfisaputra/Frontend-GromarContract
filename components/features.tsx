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

const features = [
  {
    icon: FileSignature,
    accent: 'agro',
    title: 'Digital Contracts',
    body: 'Legally binding e-contracts signed online. No paperwork, no middlemen — just secure agreements between producers and buyers.',
  },
  {
    icon: Lock,
    accent: 'marine',
    title: 'Escrow Payments',
    body: 'Buyer payments are held safely in escrow until delivery is confirmed, so both sides are fully protected on every deal.',
  },
  {
    icon: Snowflake,
    accent: 'marine',
    title: 'Cold Chain Tracking',
    body: 'Live temperature monitoring for marine products keeps every shipment fresh from the boat to the buyer.',
  },
  {
    icon: LineChart,
    accent: 'agro',
    title: 'Harvest & Catch Prediction',
    body: 'AI-powered forecasts using real-time weather, ocean and historical data help you plan supply with confidence.',
  },
  {
    icon: Scale,
    accent: 'grain',
    title: 'Price Stability',
    body: 'Lock in prices before harvest or catch. Producers get guaranteed income while buyers get predictable costs.',
  },
  {
    icon: Network,
    accent: 'agro',
    title: 'Multi-Source Fulfillment',
    body: 'Large orders can be split across multiple farmers and fishermen, then automatically combined into one contract.',
  },
]

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-background">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <ScrollReveal direction="up" distance={30}>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              Platform features
            </span>
            <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Everything you need to trade with confidence
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              One transparent platform that protects producers and buyers from the
              first handshake to final delivery.
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
