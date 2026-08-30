'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { useCartStore } from '@/lib/store/cart'
import { useAuthStore } from '@/lib/store/auth'
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Package,
  ShieldCheck,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/use-translation'

export default function CartPage() {
  const { items, total, count, fetchCart, updateItem, removeItem, clearCart, isLoading } = useCartStore()
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchCart()
  }, [user])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

  // Loading state
  if (isLoading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-agro-soft/30 to-background">
        <SiteHeader />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-10 w-10 rounded-full border-4 border-agro-soft border-t-agro animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-agro-soft/30 to-background">
      <SiteHeader />

      <div className="mx-auto max-w-5xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
          >
            <ArrowLeft size={16} /> {String(t('cart.backToShop'))}
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-foreground">
            <ShoppingBag size={26} className="text-agro" />
            {String(t('cart.title'))}
            {count > 0 && (
              <span className="rounded-full bg-agro/10 px-3 py-0.5 text-base font-bold text-agro">
                {count}
              </span>
            )}
          </h1>
          {count > 0 && (
            <button
              onClick={clearCart}
              disabled={isLoading}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 cursor-pointer"
            >
              <Trash2 size={14} /> {String(t('cart.clear'))}
            </button>
          )}
        </div>

        {/* Empty state */}
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-24 text-center">
            <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
              <ShoppingBag size={44} className="text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{String(t('cart.emptyTitle'))}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{String(t('cart.emptyHint'))}</p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-agro px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-agro/90"
            >
              {String(t('cart.shopNow'))} <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

            {/* Items list */}
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-3xl border border-border bg-card p-4 shadow-sm"
                >
                  {/* Image */}
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-secondary sm:h-28 sm:w-28">
                    {item.product.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package size={28} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/shop/${item.product.slug}`}
                        className="block text-sm font-bold text-foreground leading-snug hover:text-agro transition-colors sm:text-base"
                      >
                        {item.product.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatPrice(item.product.price)} / {item.product.unit}
                      </p>
                    </div>

                    {/* Qty controls */}
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                        disabled={isLoading || item.quantity <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:border-agro hover:text-agro disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="min-w-[28px] text-center text-sm font-bold text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        disabled={isLoading || item.quantity >= item.product.stock}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:border-agro hover:text-agro disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                      >
                        <Plus size={13} />
                      </button>
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({String(t('cart.stock')).replace('{stock}', String(item.product.stock))})
                      </span>
                    </div>
                  </div>

                  {/* Subtotal + remove */}
                  <div className="flex flex-col items-end justify-between">
                    <p className="text-base font-extrabold text-foreground">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={isLoading}
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40 cursor-pointer"
                      aria-label={String(t('cart.removeProduct'))}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary sidebar */}
            <div>
              <div className="sticky top-24 rounded-3xl border border-border bg-card p-5 shadow-sm">
                <h2 className="mb-4 text-base font-extrabold text-foreground">{String(t('cart.orderSummary'))}</h2>

                {/* Item breakdown */}
                <div className="flex flex-col gap-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-2 text-sm">
                      <span className="text-muted-foreground leading-snug">
                        {item.product.name}{' '}
                        <span className="font-semibold text-foreground">×{item.quantity}</span>
                      </span>
                      <span className="shrink-0 font-semibold text-foreground">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="my-4 border-t border-border" />

                {/* Shipping note */}
                <div className="mb-3 flex items-center gap-2 rounded-xl bg-agro-soft px-3 py-2.5 text-xs text-agro font-medium">
                  <ShieldCheck size={14} className="shrink-0" />
                  {String(t('cart.shippingNote'))}
                </div>

                {/* Total */}
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-bold text-foreground">{String(t('cart.total'))}</span>
                  <span className="text-xl font-extrabold text-foreground">{formatPrice(total)}</span>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-agro py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-agro/90 hover:shadow-md"
                >
                  {String(t('cart.checkout'))} <ArrowRight size={16} />
                </Link>

                {/* Payment methods */}
                <div className="mt-4">
                  <p className="mb-2 text-xs text-muted-foreground">{String(t('cart.paymentMethods'))}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['GoPay', 'OVO', 'DANA', 'QRIS', 'Transfer Bank'].map((m) => (
                      <span
                        key={m}
                        className="rounded-lg border border-border bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  )
}
