'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { useCartStore } from '@/lib/store/cart'
import { useAuthStore } from '@/lib/store/auth'
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ArrowRight, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { items, total, count, fetchCart, updateItem, removeItem, clearCart, isLoading } = useCartStore()
  const { user } = useAuthStore()
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

  if (isLoading) return (
    <div className="cart-page">
      <SiteHeader />
      <div className="cart-page-loading"><div className="loading-spinner" /></div>
    </div>
  )

  if (!user) return null

  return (
    <div className="cart-page">
      <SiteHeader />

      <div className="cart-page-container">
        <div className="cart-page-header">
          <Link href="/shop" className="back-link">
            <ArrowLeft size={20} /> Lanjut Belanja
          </Link>
          <h1 className="cart-page-title">
            <ShoppingBag size={28} /> Keranjang Belanja ({count})
          </h1>
          {count > 0 && (
            <button onClick={clearCart} disabled={isLoading} className="cart-clear-btn">
              <Trash2 size={16} /> Kosongkan
            </button>
          )}
        </div>

        {count === 0 ? (
          <div className="cart-page-empty">
            <div className="cart-empty-illustration">
              <ShoppingBag size={48} className="text-muted-foreground mx-auto" />
            </div>
            <h2>Keranjang Kosong</h2>
            <p>Belum ada produk di keranjang Anda</p>
            <Link href="/shop" className="btn-primary">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="cart-page-layout">
            {/* Cart Items */}
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.id} className="cart-page-item">
                  <div className="cart-page-item-image">
                    {item.product.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-xl"
                      />
                    ) : (
                      <div className="cart-page-placeholder">
                        <Package size={24} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="cart-page-item-info">
                    <Link href={`/shop/${item.product.slug}`} className="cart-page-item-name">
                      {item.product.name}
                    </Link>
                    <p className="cart-page-item-price">
                      {formatPrice(item.product.price)} / {item.product.unit}
                    </p>

                    <div className="cart-page-item-controls">
                      <button
                        onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                        disabled={isLoading || item.quantity <= 1}
                        className="qty-btn-lg"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="qty-value-lg">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        disabled={isLoading || item.quantity >= item.product.stock}
                        className="qty-btn-lg"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="cart-page-item-right">
                    <p className="cart-page-subtotal">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={isLoading}
                      className="cart-page-remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="cart-summary">
              <div className="cart-summary-card">
                <h2 className="cart-summary-title">Ringkasan Pesanan</h2>

                <div className="cart-summary-rows">
                  {items.map((item) => (
                    <div key={item.id} className="cart-summary-row">
                      <span>{item.product.name} × {item.quantity}</span>
                      <span>{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="cart-summary-divider" />

                <div className="cart-summary-total">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <div className="cart-summary-note">
                  <span>🚚 Pengiriman dihitung saat checkout</span>
                </div>

                <Link href="/checkout" className="cart-checkout-cta">
                  Lanjut ke Checkout <ArrowRight size={18} />
                </Link>

                <div className="cart-payment-methods">
                  <p>Metode Pembayaran:</p>
                  <div className="payment-icons">
                    <span>GoPay</span>
                    <span>OVO</span>
                    <span>DANA</span>
                    <span>Transfer Bank</span>
                    <span>QRIS</span>
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
