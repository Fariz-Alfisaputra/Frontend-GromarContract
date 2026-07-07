import { LoadingScreen } from '@/components/loading-screen'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { Industries } from '@/components/industries'
import { Features } from '@/components/features'
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
        <Hero />
        <Industries />
        <Features />
        <HowItWorks />
        <Audience />
        <FAQ />
        <CTA />
      </main>
      <SiteFooter />
    </div>
  )
}
