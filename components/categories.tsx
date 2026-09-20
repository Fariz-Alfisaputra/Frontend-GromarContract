'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/use-translation'
import { categoryApi } from '@/lib/api'
import { Wheat, Fish, Coffee, Leaf, Package, Shell } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  _count: { products: number }
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  rice: Wheat,
  padi: Wheat,
  kopi: Coffee,
  coffee: Coffee,
  ikan: Fish,
  fish: Fish,
  sayur: Leaf,
  vegetable: Leaf,
  rempah: Package,
  seafood: Shell,
}

const CATEGORY_COLORS = [
  'bg-agro-soft text-agro',
  'bg-marine-soft text-marine',
  'bg-grain/20 text-foreground',
  'bg-agro-soft text-agro',
  'bg-marine-soft text-marine',
  'bg-grain/20 text-foreground',
]

export function Categories() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll()
        setCategories(res.data.data)
      } catch {
        // silent fail
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [])

  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <ScrollReveal direction="up" distance={30}>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              {String(t('categories.eyebrow'))}
            </span>
            <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {String(t('categories.title'))}
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              {String(t('categories.subtitle'))}
            </p>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-3xl bg-gradient-to-br from-background to-border animate-pulse"
              />
            ))}
          </div>
        ) : (
          <StaggerContainer staggerDelay={0.08} className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, i) => {
              const Icon = CATEGORY_ICONS[cat.slug] || Package
              const colorClass = CATEGORY_COLORS[i % CATEGORY_COLORS.length]
              return (
                <StaggerItem key={cat.id}>
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    className="group flex items-center gap-5 rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${colorClass}`}>
                      <Icon className="h-7 w-7" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-foreground leading-snug">{cat.name}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {cat._count.products} {String(t('shop.product'))}
                      </p>
                    </div>
                  </Link>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        )}
      </div>
    </section>
  )
}
