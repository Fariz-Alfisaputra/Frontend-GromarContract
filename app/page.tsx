import { LoadingScreen } from '@/components/loading-screen'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { FeaturedProducts } from '@/components/featured-products'
import { Categories } from '@/components/categories'
import { WhyChooseUs } from '@/components/why-choose-us'
import { TestimonialSection } from '@/components/testimonial-section'
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

        {/* 2. Featured Products — grid from API */}
        <FeaturedProducts />

        {/* 3. Browse by Category */}
        <Categories />

        {/* 4. Why Choose Gromar */}
        <WhyChooseUs />

        {/* 5. Testimonials */}
        <TestimonialSection />

        {/* 6. FAQ */}
        <FAQ />

        {/* 7. CTA */}
        <CTA />
      </main>
      <SiteFooter />
    </div>
  )
}
