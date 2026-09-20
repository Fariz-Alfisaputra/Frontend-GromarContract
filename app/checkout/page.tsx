'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { orderApi } from '@/lib/api'
import { useCartStore } from '@/lib/store/cart'
import { useAuthStore } from '@/lib/store/auth'
import { ArrowLeft, CreditCard, ShieldCheck, Loader2, Package } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n/use-translation'

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess: (result: any) => void
        onPending: (result: any) => void
        onError: (result: any) => void
        onClose: () => void
      }) => void
    }
  }
}

export default function CheckoutPage() {
  const { items, total, fetchCart, clearLocal } = useCartStore()
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const router = useRouter()
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [snapLoaded, setSnapLoaded] = useState(false)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    fetchCart()
    loadSnapScript()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadSnapScript = () => {
    const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    if (!MIDTRANS_CLIENT_KEY) {
      console.warn('MIDTRANS_CLIENT_KEY tidak diset')
      return
    }

    if (document.getElementById('midtrans-snap')) {
      setSnapLoaded(true)
      return
    }

    const isSandbox = MIDTRANS_CLIENT_KEY.startsWith('SB-')
    const scriptSrc = isSandbox
      ? 'https://app.sandbox.midtrans.com/snap/snap.js'
      : 'https://app.midtrans.com/snap/snap.js'

    const script = document.createElement('script')
    script.id = 'midtrans-snap'
    script.src = scriptSrc
    script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY)
    script.onload = () => setSnapLoaded(true)
    document.head.appendChild(script)
  }

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error(String(t('checkout.emptyCart')))
      return
    }

    setIsProcessing(true)
    try {
      const res = await orderApi.create({ notes })
      const { snapToken, order } = res.data.data

      if (!snapToken) {
        toast.error(String(t('checkout.tokenFail')))
        return
      }

      if (!snapLoaded || !window.snap) {
        // Redirect to payment URL if snap.js failed to load
        if (res.data.data.paymentUrl) {
          window.location.href = res.data.data.paymentUrl
        }
        return
      }

      window.snap.pay(snapToken, {
        onSuccess: (result) => {
          console.log('Payment success:', result)
          clearLocal()
          router.push(`/checkout/success?order_id=${order.id}`)
        },
        onPending: (result) => {
          console.log('Payment pending:', result)
          toast.info(String(t('checkout.paymentPending')))
          router.push(`/checkout/success?order_id=${order.id}&status=pending`)
        },
        onError: (result) => {
          console.error('Payment error:', result)
          toast.error(String(t('checkout.paymentFailed')))
        },
        onClose: () => {
          toast.warning(String(t('checkout.paymentCancelled')))
          router.push(`/orders`)
        },
      })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || String(t('checkout.createOrderFail')))
    } finally {
      setIsProcessing(false)
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

  if (!user) return null

  return (
    <div className="checkout-page">
      <SiteHeader />

      <div className="checkout-container">
        <div className="checkout-header">
          <Link href="/cart" className="back-link">
            <ArrowLeft size={20} /> {String(t('checkout.backToCart'))}
          </Link>
          <h1 className="checkout-title">
            <CreditCard size={28} /> {String(t('checkout.title'))}
          </h1>
        </div>

        <div className="checkout-layout">
          {/* Left: Order Details */}
          <div className="checkout-left">
            {/* Customer Info */}
            <div className="checkout-card">
              <h2 className="checkout-card-title">{String(t('checkout.buyerInfo'))}</h2>
              <div className="checkout-info-row">
                <span className="checkout-info-label">{String(t('checkout.name'))}</span>
                <span className="checkout-info-value">{user.name}</span>
              </div>
              <div className="checkout-info-row">
                <span className="checkout-info-label">{String(t('checkout.email'))}</span>
                <span className="checkout-info-value">{user.email}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="checkout-card">
              <h2 className="checkout-card-title">{String(t('checkout.orderItems')).replace('{count}', String(items.length))}</h2>
              {items.map((item) => (
                <div key={item.id} className="checkout-item">
                  <div className="checkout-item-image">
                    {item.product.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="checkout-item-placeholder">
                        <Package size={20} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="checkout-item-info">
                    <p className="checkout-item-name">{item.product.name}</p>
                    <p className="checkout-item-qty">
                      {String(t('checkout.itemUnit')).replace('{quantity}', String(item.quantity)).replace('{unit}', item.product.unit)} × {formatPrice(item.product.price)}
                    </p>
                  </div>
                  <span className="checkout-item-total">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="checkout-card">
              <h2 className="checkout-card-title">{String(t('checkout.notesTitle'))}</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={String(t('checkout.notesPlaceholder'))}
                className="checkout-notes"
                rows={3}
              />
            </div>
          </div>

          {/* Right: Payment Summary */}
          <div className="checkout-right">
            <div className="checkout-summary-card">
              <h2 className="checkout-summary-title">{String(t('checkout.paymentSummary'))}</h2>

              <div className="checkout-summary-rows">
                <div className="checkout-summary-row">
                  <span>{String(t('checkout.subtotal'))} {String(t('checkout.numProducts')).replace('{count}', String(items.length))}</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="checkout-summary-row">
                  <span>{String(t('checkout.shippingCost'))}</span>
                  <span className="text-green-500">{String(t('checkout.free'))}</span>
                </div>
              </div>

              <div className="checkout-summary-divider" />

              <div className="checkout-summary-total">
                <span>{String(t('checkout.totalPayment'))}</span>
                <span>{formatPrice(total)}</span>
              </div>

              {/* Security badges */}
              <div className="checkout-security">
                <ShieldCheck size={16} />
                <span>{String(t('checkout.secureTransaction'))}</span>
              </div>

              {/* Payment Methods */}
              <div className="checkout-methods">
                <p className="checkout-methods-label">{String(t('checkout.methodsAvailable'))}</p>
                <div className="checkout-methods-grid">
                  {['GoPay', 'OVO', 'DANA', 'ShopeePay', 'QRIS', 'BCA VA', 'BNI VA', 'Mandiri VA', 'Indomaret', 'Alfamart'].map((m) => (
                    <span key={m} className="payment-method-tag">{m}</span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing || items.length === 0}
                className="checkout-pay-btn"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    {String(t('checkout.processing'))}
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    {String(t('checkout.payNow'))} {formatPrice(total)}
                  </>
                )}
              </button>

              <p className="checkout-disclaimer">
                {String(t('checkout.disclaimer'))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
