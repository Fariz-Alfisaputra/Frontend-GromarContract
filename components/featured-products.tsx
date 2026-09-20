'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/shop/ProductCard'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/use-translation'
import { productApi } from '@/lib/api'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  imageUrl: string | null
  unit: string
  stock: number
  category: { name: string; slug: string }
}

export function FeaturedProducts() {
  const { t } = useTranslation()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productApi.getAll({ limit: 8, sort: 'createdAt' })
        setProducts(res.data.data)
      } catch {
        // silent fail
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <ScrollReveal direction="up" distance={30}>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              {String(t('featuredProducts.eyebrow'))}
            </span>
            <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {String(t('featuredProducts.title'))}
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              {String(t('featuredProducts.subtitle'))}
            </p>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-72 rounded-3xl bg-gradient-to-br from-secondary to-border animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-14 rounded-3xl border border-dashed border-border bg-card py-16 text-center">
            <p className="font-semibold text-foreground">{String(t('featuredProducts.empty'))}</p>
          </div>
        ) : (
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <ScrollReveal direction="up" distance={20} delay={0.2}>
          <div className="mt-10 text-center">
            <Button
              asChild
              variant="outline"
              className="group h-12 rounded-full border-border px-7 text-base font-semibold"
            >
              <Link href="/shop">
                {String(t('featuredProducts.viewAll'))}
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
