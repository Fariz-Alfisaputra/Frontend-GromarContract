'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

const faqs = [
  {
    q: 'How does GROMAR Contract work?',
    a: 'Producers list their upcoming harvest or catch, buyers discover them and agree on volume, quality and price. GROMAR turns that agreement into a secure digital contract and holds payment in escrow until delivery is confirmed.',
  },
  {
    q: 'How do you handle marine products and cold chain?',
    a: 'Marine contracts include integrated cold-chain tracking. Temperature is monitored throughout transport so buyers receive sashimi-grade freshness, and any breach is flagged before delivery.',
  },
  {
    q: 'What happens if a harvest fails or a catch is insufficient?',
    a: 'Our multi-source fulfilment can automatically split a large order across several farmers or fishermen. If supply still falls short, escrow protects the buyer and the contract terms define fair resolution for both sides.',
  },
  {
    q: 'What are the payment terms?',
    a: 'Buyers fund the contract into escrow when it is signed. Funds are released to the producer only once delivery is verified, giving both parties full protection with no middlemen.',
  },
  {
    q: 'Who can join the platform?',
    a: 'Farmers, fishermen, restaurants, hotels, supermarkets and distributors across Indonesia can register. Producers gain guaranteed buyers while buyers secure reliable, transparent supply.',
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="scroll-mt-20 bg-secondary">
      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            FAQ
          </span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Got questions? We have answers
          </h2>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((item, i) => {
            const isOpen = open === i
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
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
            )
          })}
        </div>
      </div>
    </section>
  )
}
