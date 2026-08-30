'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { orderApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store/auth'
import { Package, ChevronDown, ChevronUp, User } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n/use-translation'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: { name: string; unit: string; imageUrl?: string | null }
}

interface Order {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  snapToken: string | null
  orderItems: OrderItem[]
  user?: {
    name: string
    email: string
  }
}

export default function OrdersPage() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const STATUS_MAP: Record<string, { label: string; color: string }> = {
    PENDING: { label: String(t('orders.statusPending')), color: '#f59e0b' },
    PAID: { label: String(t('orders.statusPaid')), color: '#10b981' },
    PROCESSING: { label: String(t('orders.statusProcessing')), color: '#3b82f6' },
    SHIPPED: { label: String(t('orders.statusShipped')), color: '#8b5cf6' },
    DELIVERED: { label: String(t('orders.statusDelivered')), color: '#059669' },
    CANCELLED: { label: String(t('orders.statusCancelled')), color: '#ef4444' },
  }

  const fetchOrders = async () => {
    if (!user) return
    try {
      const fetchFn = user.role === 'ADMIN' ? orderApi.getAllAdmin : orderApi.getAll
      const res = await fetchFn()
      setOrders(res.data.data)
    } catch (err) {
      console.error('Gagal mengambil data pesanan', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchOrders()
  }, [user])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await orderApi.updateStatus(orderId, newStatus)
      toast.success(String(t('orders.updatedStatus')))
      fetchOrders()
    } catch {
      toast.error(String(t('orders.updateStatusFail')))
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })

  if (isLoading) return (
    <div className="orders-page">
      <SiteHeader />
      <div className="orders-loading"><div className="loading-spinner" /></div>
    </div>
  )

  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className="orders-page">
      <SiteHeader />

      <div className="orders-container">
        <h1 className="orders-title">
          <Package size={28} /> {isAdmin ? String(t('orders.titleAdmin')) : String(t('orders.title'))}
        </h1>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <span className="orders-empty-icon">📦</span>
            <h2>{isAdmin ? String(t('orders.noOrdersAdmin')) : String(t('orders.noOrders'))}</h2>
            {!isAdmin && <Link href="/shop" className="btn-primary">{String(t('orders.statusStartShopping'))}</Link>}
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: '#6b7280' }
              const isExpanded = expandedId === order.id

              return (
                <div key={order.id} className="order-card">
                  <div
                    className="order-card-header"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <div className="order-card-left">
                      <code className="order-id">{order.id.slice(0, 16)}...</code>
                      <span className="order-date">{formatDate(order.createdAt)}</span>
                      {isAdmin && order.user && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <User size={12} />
                          <span>{String(t('orders.applicant'))} <strong className="text-foreground">{order.user.name}</strong> ({order.user.email})</span>
                        </div>
                      )}
                    </div>
                    <div className="order-card-right">
                      <span
                        className="order-status-badge"
                        style={{ background: `${statusInfo.color}20`, color: statusInfo.color }}
                      >
                        {statusInfo.label}
                      </span>
                      <span className="order-total">{formatPrice(order.totalAmount)}</span>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="order-card-body">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="order-item-row">
                          <span>{item.product.name}</span>
                          <span>{item.quantity} {item.product.unit}</span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}

                      {/* Admin Update Status Dropdown */}
                      {isAdmin && (
                        <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-xs font-bold text-muted-foreground">{String(t('orders.changeStatus'))}</span>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="bg-card border border-border text-xs rounded-xl px-3 py-2 font-semibold text-foreground focus:ring-1 focus:ring-primary outline-none"
                            style={{ cursor: 'pointer', appearance: 'auto' }}
                          >
                            <option value="PENDING">{String(t('orders.statusPending'))} (PENDING)</option>
                            <option value="PAID">{String(t('orders.statusPaid'))} (PAID)</option>
                            <option value="PROCESSING">{String(t('orders.statusProcessing'))} (PROCESSING)</option>
                            <option value="SHIPPED">{String(t('orders.statusShipped'))} (SHIPPED)</option>
                            <option value="DELIVERED">{String(t('orders.statusDelivered'))} (DELIVERED)</option>
                            <option value="CANCELLED">{String(t('orders.statusCancelled'))} (CANCELLED)</option>
                          </select>
                        </div>
                      )}

                      {!isAdmin && order.status === 'PENDING' && order.snapToken && (
                        <button
                          className="order-pay-btn"
                          onClick={() => router.push(`/checkout?retry=${order.id}`)}
                        >
                          {String(t('orders.payNow'))}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  )
}
