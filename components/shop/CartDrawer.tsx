'use client'

import { useEffect } from 'react'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Package } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { useAuthStore } from '@/lib/store/auth'
import { useTranslation } from '@/lib/i18n/use-translation'

export function CartDrawer() {
  const { items, total, count, isOpen, setOpen, updateItem, removeItem, isLoading } = useCartStore()
  const { user } = useAuthStore()
  const { t } = useTranslation()

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[420px] flex-col bg-background shadow-2xl"
        style={{ animation: 'slideInRight 0.25s ease' }}
        role="dialog"
        aria-modal="true"
        aria-label={String(t('cartDrawer.title'))}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <ShoppingBag size={20} className="text-agro" />
            <span>{String(t('cartDrawer.title'))}</span>
            {count > 0 && (
              <span className="ml-0.5 rounded-full bg-agro/10 px-2 py-0.5 text-xs font-bold text-agro">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 hover:border-red-200 cursor-pointer"
            aria-label={String(t('cartDrawer.close'))}
          >
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                <ShoppingBag size={36} className="text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{String(t('cartDrawer.empty'))}</p>
                <p className="mt-1 text-sm text-muted-foreground">{String(t('cartDrawer.emptyHint'))}</p>
              </div>
              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="rounded-full bg-agro px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-agro/90"
              >
                {String(t('cartDrawer.shopNow'))}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-2xl border border-border bg-card p-3"
                >
                  {/* Product image */}
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-secondary">
                    {item.product.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package size={20} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <p className="truncate text-sm font-semibold text-foreground leading-snug">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(item.product.price)}/{item.product.unit}
                    </p>

                    {/* Qty controls */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <button
                        onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                        disabled={isLoading || item.quantity <= 1}
                        className="flex h-6 w-6 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:border-agro hover:text-agro disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="min-w-[20px] text-center text-sm font-bold text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        disabled={isLoading || item.quantity >= item.product.stock}
                        className="flex h-6 w-6 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:border-agro hover:text-agro disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal + remove */}
                  <div className="flex flex-col items-end justify-between">
                    <p className="text-sm font-bold text-agro">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={isLoading}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40 cursor-pointer"
                      aria-label={String(t('cartDrawer.removeItem'))}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — only shown when cart has items */}
        {items.length > 0 && (
          <div className="border-t border-border bg-card px-5 py-4">
            {/* Total */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{String(t('cartDrawer.total'))}</span>
              <span className="text-lg font-extrabold text-foreground">{formatPrice(total)}</span>
            </div>

            {/* CTA */}
            {user ? (
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-agro py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-agro/90 hover:shadow-md"
              >
                {String(t('cartDrawer.checkout'))} <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-agro py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-agro/90"
              >
                {String(t('cartDrawer.loginCheckout'))} <ArrowRight size={16} />
              </Link>
            )}

            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="mt-2.5 flex w-full items-center justify-center rounded-full border border-border py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              {String(t('cartDrawer.fullCart'))}
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
