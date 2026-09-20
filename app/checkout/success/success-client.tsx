'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { orderApi } from '@/lib/api'
import { CheckCircle, Clock, Package, ShoppingBag } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/use-translation'

interface Order {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  orderItems: Array<{
    id: string
    quantity: number
    price: number
    product: { name: string; unit: string }
  }>
}

export function CheckoutSuccessClient() {
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const orderId = searchParams.get('order_id')
  const status = searchParams.get('status')
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (orderId) {
      orderApi.getById(orderId)
        .then((res) => setOrder(res.data.data))
        .catch(console.error)
    }
  }, [orderId])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

  const isPending = status === 'pending' || order?.status === 'PENDING'

  return (
    <div className="success-page">
      <div className="success-card">
        <div className={`success-icon-wrapper ${isPending ? 'pending' : 'success'}`}>
          {isPending ? <Clock size={64} /> : <CheckCircle size={64} />}
        </div>

        <h1 className="success-title">
          {isPending ? String(t('checkoutSuccess.pendingTitle')) : String(t('checkoutSuccess.successTitle'))}
        </h1>
        <p className="success-subtitle">
          {isPending
            ? String(t('checkoutSuccess.pendingSubtitle'))
            : String(t('checkoutSuccess.successSubtitle'))}
        </p>

        {order && (
          <div className="success-order-detail">
            <div className="success-order-id">
              <span>{String(t('checkoutSuccess.orderId'))}</span>
              <code className="order-id-code">{order.id}</code>
            </div>

            <div className="success-order-status">
              <Package size={16} />
              <span>{String(t('checkoutSuccess.status'))} </span>
              <span className={`status-badge status-${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>

            <div className="success-items">
              {order.orderItems.map((item) => (
                <div key={item.id} className="success-item">
                  <span>{item.product.name} × {item.quantity} {item.product.unit}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="success-total">
              <span>{String(t('checkoutSuccess.total'))}</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        )}

        <div className="success-actions">
          <Link href="/orders" className="btn-secondary">
            <Package size={18} /> {String(t('checkoutSuccess.viewOrders'))}
          </Link>
          <Link href="/shop" className="btn-primary">
            <ShoppingBag size={18} /> {String(t('checkoutSuccess.continueShopping'))}
          </Link>
        </div>
      </div>
    </div>
  )
}