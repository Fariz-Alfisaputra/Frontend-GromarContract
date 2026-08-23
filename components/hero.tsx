import Link from 'next/link'
import { ArrowRight, Store, PlayCircle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section id="home" className="relative isolate min-h-[100svh] overflow-hidden">
      {/* Cinematic background with slow pan */}
      <div className="absolute inset-0 -z-20">
        <div
          className="h-full w-full animate-pan bg-cover bg-center"
          style={{ backgroundImage: 'url(/coastline.png)' }}
        />
      </div>

      {/* Themed gradient + darkening overlay for legibility */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0c3b1e]/85 via-[#0b2f3a]/55 to-[#0a2f5e]/85"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-5 py-32 text-center sm:px-8">
        <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md">
          <ShieldCheck className="h-4 w-4" />
          Transparent contracts · Agro &amp; Marine · Launching 2026
        </span>

        <h1
          className="animate-fade-up mt-7 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
          style={{ animationDelay: '0.1s' }}
        >
          Growing Trust Between{' '}
          <span className="animated-gradient-text">Land &amp; Sea</span>
        </h1>

        <p
          className="animate-fade-up mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/85 sm:text-xl"
          style={{ animationDelay: '0.2s' }}
        >
          GROMAR Contract connects farmers and fishermen with restaurants,
          hotels and distributors through transparent smart contracts — securing
          fair prices before harvest and guaranteed supply before catch.
        </p>

        <div
          className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row"
          style={{ animationDelay: '0.3s' }}
        >
          <Button
            asChild
            className="group h-13 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-black/20 transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
          >
            <Link href="/shop">
              <Store className="mr-1 h-5 w-5" />
              Enter Marketplace
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="group h-13 rounded-full border-white/40 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur-md transition-transform hover:-translate-y-0.5 hover:bg-white/20"
          >
            <Link href="/#how">
              <PlayCircle className="mr-1 h-5 w-5" />
              See how it works
            </Link>
          </Button>
        </div>

        {/* Glass stat strip */}
        <dl
          className="animate-fade-up mt-14 grid w-full max-w-2xl grid-cols-3 gap-4 rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md"
          style={{ animationDelay: '0.4s' }}
        >
          <div>
            <dt className="text-3xl font-extrabold text-white sm:text-4xl">12k+</dt>
            <dd className="mt-1 text-sm text-white/75">Producers onboard</dd>
          </div>
          <div className="border-x border-white/15">
            <dt className="text-3xl font-extrabold text-white sm:text-4xl">98%</dt>
            <dd className="mt-1 text-sm text-white/75">Contracts fulfilled</dd>
          </div>
          <div>
            <dt className="text-3xl font-extrabold text-white sm:text-4xl">0</dt>
            <dd className="mt-1 text-sm text-white/75">Hidden fees</dd>
          </div>
        </dl>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="flex h-9 w-6 items-start justify-center rounded-full border-2 border-white/50 p-1.5">
          <span className="h-2 w-1 animate-float rounded-full bg-white/80" />
        </div>
      </div>
    </section>
  )
}
