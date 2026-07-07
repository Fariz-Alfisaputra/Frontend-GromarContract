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

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Menunggu Pembayaran', color: '#f59e0b' },
  PAID: { label: 'Dibayar', color: '#10b981' },
  PROCESSING: { label: 'Diproses', color: '#3b82f6' },
  SHIPPED: { label: 'Dikirim', color: '#8b5cf6' },
  DELIVERED: { label: 'Diterima', color: '#059669' },
  CANCELLED: { label: 'Dibatalkan', color: '#ef4444' },
}

export default function OrdersPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
      toast.success('Status pesanan berhasil diperbarui!')
      fetchOrders()
    } catch {
      toast.error('Gagal memperbarui status pesanan.')
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
          <Package size={28} /> {isAdmin ? 'Manajemen Pesanan Platform (Super Admin)' : 'Pesanan Saya'}
        </h1>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <span className="orders-empty-icon">📦</span>
            <h2>{isAdmin ? 'Belum ada pesanan masuk di platform' : 'Belum ada pesanan'}</h2>
            {!isAdmin && <Link href="/shop" className="btn-primary">Mulai Belanja</Link>}
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
                          <span>Pengaju: <strong className="text-foreground">{order.user.name}</strong> ({order.user.email})</span>
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
                          <span className="text-xs font-bold text-muted-foreground">Ubah Status Transaksi (Super Admin):</span>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="bg-card border border-border text-xs rounded-xl px-3 py-2 font-semibold text-foreground focus:ring-1 focus:ring-primary outline-none"
                            style={{ cursor: 'pointer', appearance: 'auto' }}
                          >
                            <option value="PENDING">Menunggu Pembayaran (PENDING)</option>
                            <option value="PAID">Dibayar (PAID)</option>
                            <option value="PROCESSING">Diproses (PROCESSING)</option>
                            <option value="SHIPPED">Dikirim (SHIPPED)</option>
                            <option value="DELIVERED">Diterima (DELIVERED)</option>
                            <option value="CANCELLED">Dibatalkan (CANCELLED)</option>
                          </select>
                        </div>
                      )}

                      {!isAdmin && order.status === 'PENDING' && order.snapToken && (
                        <button
                          className="order-pay-btn"
                          onClick={() => router.push(`/checkout?retry=${order.id}`)}
                        >
                          Bayar Sekarang
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
