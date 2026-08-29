import { LoadingScreen } from '@/components/loading-screen'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { CommodityTicker } from '@/components/dashboard/commodity-ticker'
import { Industries } from '@/components/industries'
import { HomeCalculatorSection } from '@/components/home-calculator-section'
import { Features } from '@/components/features'
import { BusinessComparison } from '@/components/dashboard/business-comparison'
import { HowItWorks } from '@/components/how-it-works'
import { Audience } from '@/components/audience'
import { FAQ } from '@/components/faq'
import { CTA } from '@/components/cta'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <LoadingScreen />
      <SiteHeader variant="overlay" />
      <main>
        {/* 1. Hero with Parallax & Fade-on-scroll */}
        <Hero />

        {/* 2. Real-time Market Price Ticker */}
        <CommodityTicker />

        {/* 3. Agro & Marine Pillars */}
        <Industries />

        {/* 4. Interactive B2B Bulk Savings Calculator */}
        <HomeCalculatorSection />

        {/* 5. Platform Features with Staggered Card Reveals */}
        <Features />

        {/* 6. Business Value Proposition Comparison Matrix */}
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <BusinessComparison />
        </div>

        {/* 7. How Smart Contract Works */}
        <HowItWorks />

        {/* 8. Target Audience (Producers vs Buyers) */}
        <Audience />

        {/* 9. FAQ Accordion */}
        <FAQ />

        {/* 10. Call-to-action Banner */}
        <CTA />
      </main>
      <SiteFooter />
    </div>
  )
}
