'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { orderApi } from '@/lib/api'
import { CheckCircle, Clock, Package, ShoppingBag } from 'lucide-react'

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

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const status = searchParams.get('status')
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (orderId) {
      orderApi.getById(orderId)
        .then(res => setOrder(res.data.data))
        .catch(console.error)
    }
  }, [orderId])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

  const isPending = status === 'pending' || order?.status === 'PENDING'

  return (
    <div className="success-page">
      <div className="success-card">
        {/* Icon */}
        <div className={`success-icon-wrapper ${isPending ? 'pending' : 'success'}`}>
          {isPending ? (
            <Clock size={64} />
          ) : (
            <CheckCircle size={64} />
          )}
        </div>

        {/* Title */}
        <h1 className="success-title">
          {isPending ? 'Menunggu Pembayaran' : 'Pembayaran Berhasil! 🎉'}
        </h1>
        <p className="success-subtitle">
          {isPending
            ? 'Selesaikan pembayaran sesuai instruksi yang dikirim ke email Anda.'
            : 'Terima kasih! Pesanan Anda sedang diproses.'}
        </p>

        {/* Order Details */}
        {order && (
          <div className="success-order-detail">
            <div className="success-order-id">
              <span>Order ID:</span>
              <code className="order-id-code">{order.id}</code>
            </div>

            <div className="success-order-status">
              <Package size={16} />
              <span>Status: </span>
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
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="success-actions">
          <Link href="/orders" className="btn-secondary">
            <Package size={18} /> Lihat Pesanan
          </Link>
          <Link href="/shop" className="btn-primary">
            <ShoppingBag size={18} /> Lanjut Belanja
          </Link>
        </div>
      </div>
    </div>
  )
}
