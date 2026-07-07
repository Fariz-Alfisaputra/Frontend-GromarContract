'use client'

import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Package } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { useAuthStore } from '@/lib/store/auth'

export function CartDrawer() {
  const { items, total, count, isOpen, setOpen, updateItem, removeItem, isLoading } = useCartStore()
  const { user } = useAuthStore()

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="cart-overlay" onClick={() => setOpen(false)} />

      {/* Drawer */}
      <div className="cart-drawer">
        {/* Header */}
        <div className="cart-header">
          <div className="cart-title">
            <ShoppingBag size={20} />
            <span>Keranjang ({count})</span>
          </div>
          <button onClick={() => setOpen(false)} className="cart-close">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="cart-items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={48} className="cart-empty-icon" />
              <p>Keranjang kosong</p>
              <Link href="/shop" onClick={() => setOpen(false)} className="cart-shop-link">
                Belanja Sekarang
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  {item.product.imageUrl ? (
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  ) : (
                    <div className="cart-item-placeholder">
                      <Package size={24} className="text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="cart-item-info">
                  <p className="cart-item-name">{item.product.name}</p>
                  <p className="cart-item-price">{formatPrice(item.product.price)}/{item.product.unit}</p>

                  <div className="cart-item-controls">
                    <button
                      onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                      disabled={isLoading || item.quantity <= 1}
                      className="qty-btn"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                      disabled={isLoading || item.quantity >= item.product.stock}
                      className="qty-btn"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <div className="cart-item-right">
                  <p className="cart-item-subtotal">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={isLoading}
                    className="cart-item-remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <span className="cart-total-amount">{formatPrice(total)}</span>
            </div>

            {user ? (
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="cart-checkout-btn"
              >
                Checkout <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="cart-checkout-btn"
              >
                Login untuk Checkout <ArrowRight size={16} />
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  )
}
