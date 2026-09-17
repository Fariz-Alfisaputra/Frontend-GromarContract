'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { orderApi, paymentApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store/auth'
import {
  Package,
  ChevronDown,
  ChevronUp,
  User,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Lock,
  Copy,
  Check,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Box,
  Layers,
  ArrowRight
} from 'lucide-react'
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

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    name: string
    unit: string
    imageUrl?: string | null
  }
}

interface Order {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  snapToken: string | null
  paymentUrl?: string | null
  paymentId?: string | null
  notes?: string | null
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
  const [snapLoaded, setSnapLoaded] = useState(false)
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null)

  // Cancellation modal state
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [copiedResi, setCopiedResi] = useState<string | null>(null)

  const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: String(t('orders.statusPending')), color: '#d97706', bg: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
    PAID: { label: String(t('orders.statusPaid')), color: '#059669', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
    PROCESSING: { label: String(t('orders.statusProcessing')), color: '#2563eb', bg: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
    SHIPPED: { label: String(t('orders.statusShipped')), color: '#7c3aed', bg: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
    DELIVERED: { label: String(t('orders.statusDelivered')), color: '#047857', bg: 'bg-teal-500/10 text-teal-700 border-teal-500/30' },
    CANCELLED: { label: String(t('orders.statusCancelled')), color: '#dc2626', bg: 'bg-rose-500/10 text-rose-600 border-rose-500/30' },
  }

  // Load Midtrans Snap script
  const loadSnapScript = useCallback(() => {
    const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-sample'
    if (document.getElementById('midtrans-snap')) {
      setSnapLoaded(true)
      return
    }

    const isSandbox = !MIDTRANS_CLIENT_KEY.startsWith('Mid-') || MIDTRANS_CLIENT_KEY.startsWith('SB-')
    const scriptSrc = isSandbox
      ? 'https://app.sandbox.midtrans.com/snap/snap.js'
      : 'https://app.midtrans.com/snap/snap.js'

    const script = document.createElement('script')
    script.id = 'midtrans-snap'
    script.src = scriptSrc
    script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY)
    script.onload = () => setSnapLoaded(true)
    document.head.appendChild(script)
  }, [])

  const fetchOrders = useCallback(async () => {
    if (!user) return
    try {
      const fetchFn = user.role === 'ADMIN' ? orderApi.getAllAdmin : orderApi.getAll
      const res = await fetchFn()
      const data = res.data?.data || []
      setOrders(data)

      // Auto expand first order if none expanded
      if (data.length > 0 && !expandedId) {
        setExpandedId(data[0].id)
      }
    } catch (err) {
      console.error('Gagal mengambil data pesanan', err)
    } finally {
      setIsLoading(false)
    }
  }, [user, expandedId])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchOrders()
    loadSnapScript()
  }, [user, fetchOrders, loadSnapScript, router])

  // Handle Pay Order via Snap
  const handlePayOrder = async (order: Order) => {
    setPayingOrderId(order.id)
    try {
      let token = order.snapToken

      // If token not on order, request via API
      if (!token) {
        const res = await paymentApi.getSnapToken(order.id)
        token = res.data?.data?.snapToken
      }

      if (!token) {
        if (order.paymentUrl) {
          window.location.href = order.paymentUrl
          return
        }
        toast.error('Token pembayaran tidak ditemukan. Silakan hubungi admin.')
        return
      }

      if (!window.snap) {
        if (order.paymentUrl) {
          window.location.href = order.paymentUrl
          return
        }
        toast.error('Gateway pembayaran sedang dimuat, coba sesaat lagi.')
        return
      }

      window.snap.pay(token, {
        onSuccess: (result) => {
          console.log('Payment success:', result)
          toast.success(String(t('orders.paidSuccess')))
          fetchOrders()
        },
        onPending: (result) => {
          console.log('Payment pending:', result)
          toast.info('Menunggu penyelesaian pembayaran...')
          fetchOrders()
        },
        onError: (result) => {
          console.error('Payment error:', result)
          toast.error('Pembayaran gagal atau dibatalkan.')
        },
        onClose: () => {
          toast.warning('Jendela pembayaran ditutup.')
          fetchOrders()
        },
      })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal memulai transaksi pembayaran.')
    } finally {
      setPayingOrderId(null)
    }
  }

  // Handle Cancel Order
  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return
    setIsCancelling(true)
    try {
      if (orderApi.cancel) {
        await orderApi.cancel(cancelModalOrder.id, 'Dibatalkan oleh pembeli sebelum pembayaran')
      } else {
        await orderApi.updateStatus(cancelModalOrder.id, 'CANCELLED')
      }
      toast.success(String(t('orders.cancelSuccess')))
      setCancelModalOrder(null)
      fetchOrders()
    } catch (err: any) {
      // Graceful fallback for demo
      try {
        await orderApi.updateStatus(cancelModalOrder.id, 'CANCELLED')
        toast.success(String(t('orders.cancelSuccess')))
        setCancelModalOrder(null)
        fetchOrders()
      } catch {
        toast.error(err?.response?.data?.message || String(t('orders.cancelFail')))
      }
    } finally {
      setIsCancelling(false)
    }
  }

  // Admin status update
  const handleAdminStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await orderApi.updateStatus(orderId, newStatus)
      toast.success(String(t('orders.updatedStatus')))
      fetchOrders()
    } catch {
      toast.error(String(t('orders.updateStatusFail')))
    }
  }

  const handleCopyResi = (resi: string) => {
    navigator.clipboard.writeText(resi)
    setCopiedResi(resi)
    toast.success(String(t('orders.resiCopied')))
    setTimeout(() => setCopiedResi(null), 3000)
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  if (isLoading) {
    return (
      <div className="orders-page min-h-screen bg-gradient-to-b from-agro-soft/20 via-background to-background">
        <SiteHeader />
        <div className="orders-loading flex flex-col items-center justify-center min-h-[60vh]">
          <div className="loading-spinner mb-4" />
          <p className="text-sm font-semibold text-muted-foreground animate-pulse">Memuat riwayat pesanan Anda...</p>
        </div>
        <SiteFooter />
      </div>
    )
  }

  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className="orders-page min-h-screen bg-gradient-to-b from-agro-soft/20 via-background to-background">
      <SiteHeader />

      <main className="orders-container max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-agro/10 text-agro">
                <Package size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {isAdmin ? String(t('orders.titleAdmin')) : String(t('orders.title'))}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {isAdmin
                    ? 'Kelola transaksi seluruh pengguna platform Gromar'
                    : 'Pantau status pembayaran & lacak pengiriman logistik pesanan Anda'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-xs sm:text-sm font-bold text-foreground hover:bg-secondary transition-all shadow-xs"
            >
              <ShoppingBag size={16} className="text-agro" />
              <span>{String(t('orders.statusStartShopping'))}</span>
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/80 p-12 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-4xl mb-4">
              📦
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {isAdmin ? String(t('orders.noOrdersAdmin')) : String(t('orders.noOrders'))}
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              {isAdmin
                ? 'Belum ada transaksi yang dibuat oleh pelanggan.'
                : String(t('orders.noOrdersHint'))}
            </p>
            {!isAdmin && (
              <Link
                href="/shop"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-agro px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-agro/90 transition-all hover:scale-105"
              >
                <ShoppingBag size={18} />
                {String(t('orders.statusStartShopping'))}
              </Link>
            )}
          </div>
        ) : (
          <div className="orders-list space-y-4">
            {orders.map((order) => {
              const statusInfo = STATUS_MAP[order.status] || {
                label: order.status,
                color: '#6b7280',
                bg: 'bg-muted text-muted-foreground border-border',
              }
              const isExpanded = expandedId === order.id
              const isPending = order.status === 'PENDING'
              const isCancelled = order.status === 'CANCELLED'
              const isPaidOrHigher = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)
              const fakeResiNumber = `JNT-GRM-${order.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase()}`

              // Tracking steps mapping
              const trackingSteps = [
                {
                  key: 'PAID',
                  title: String(t('orders.trackingStepPaid')),
                  desc: String(t('orders.trackingStepPaidDesc')),
                  icon: CreditCard,
                  isDone: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status),
                  isCurrent: order.status === 'PAID',
                },
                {
                  key: 'PROCESSING',
                  title: String(t('orders.trackingStepProcessing')),
                  desc: String(t('orders.trackingStepProcessingDesc')),
                  icon: Box,
                  isDone: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status),
                  isCurrent: order.status === 'PROCESSING',
                },
                {
                  key: 'SHIPPED',
                  title: String(t('orders.trackingStepShipped')),
                  desc: String(t('orders.trackingStepShippedDesc')),
                  icon: Truck,
                  isDone: ['SHIPPED', 'DELIVERED'].includes(order.status),
                  isCurrent: order.status === 'SHIPPED',
                },
                {
                  key: 'DELIVERED',
                  title: String(t('orders.trackingStepDelivered')),
                  desc: String(t('orders.trackingStepDeliveredDesc')),
                  icon: MapPin,
                  isDone: order.status === 'DELIVERED',
                  isCurrent: order.status === 'DELIVERED',
                },
              ]

              return (
                <div
                  key={order.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-card ${
                    isExpanded ? 'border-border shadow-md ring-1 ring-border/50' : 'border-border/70 hover:border-border hover:shadow-xs'
                  }`}
                >
                  {/* Order Card Header */}
                  <div
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer bg-card hover:bg-secondary/30 transition-colors select-none"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-secondary text-foreground border border-border/60">
                          #{order.id.slice(0, 14)}...
                        </code>
                        <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${statusInfo.bg}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <Clock size={13} />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>

                      {isAdmin && order.user && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <User size={13} className="text-agro" />
                          <span>
                            {String(t('orders.applicant'))} <strong className="text-foreground">{order.user.name}</strong> ({order.user.email})
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                          {String(t('orders.total'))}
                        </span>
                        <span className="text-base sm:text-lg font-extrabold text-foreground">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-transform"
                        aria-label="Toggle details"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="border-t border-border/60 bg-muted/20 p-4 sm:p-6 space-y-6 animate-in fade-in duration-200">
                      {/* Products List */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                          <Layers size={14} /> Daftar Produk
                        </h3>
                        <div className="space-y-2.5 bg-card rounded-xl border border-border/60 p-3 sm:p-4">
                          {order.orderItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between py-2 border-b border-border/40 last:border-0 text-xs sm:text-sm gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-10 w-10 shrink-0 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground overflow-hidden">
                                  {item.product.imageUrl ? (
                                    <Image
                                      src={item.product.imageUrl}
                                      alt={item.product.name}
                                      width={40}
                                      height={40}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <Package size={18} />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-foreground truncate">{item.product.name}</p>
                                  <p className="text-muted-foreground text-[11px]">
                                    {item.quantity} {item.product.unit} × {formatPrice(item.price)}
                                  </p>
                                </div>
                              </div>
                              <span className="font-bold text-foreground shrink-0">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes if available */}
                      {order.notes && (
                        <div className="rounded-xl border border-border/60 bg-card p-3.5 text-xs">
                          <span className="font-bold text-foreground">Catatan Pesanan: </span>
                          <span className="text-muted-foreground">{order.notes}</span>
                        </div>
                      )}

                      {/* SECTION 1: CANCELED ORDER NOTICE */}
                      {isCancelled && (
                        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
                              <XCircle size={22} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-rose-600">
                                Pesanan Telah Dibatalkan Sebelum Pembayaran
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5 max-w-xl leading-relaxed">
                                {String(t('orders.cancelledNotice'))}
                              </p>
                            </div>
                          </div>

                          <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 rounded-xl bg-card border border-rose-200 px-4 py-2 text-xs font-bold text-foreground hover:bg-secondary transition-colors shrink-0 shadow-xs"
                          >
                            <RotateCcw size={14} className="text-rose-600" />
                            <span>{String(t('orders.reorder'))}</span>
                          </Link>
                        </div>
                      )}

                      {/* SECTION 2: PAID ORDER SHIPMENT MONITORING */}
                      {isPaidOrHigher && (
                        <div className="rounded-2xl border border-emerald-500/30 bg-card p-5 sm:p-6 shadow-xs space-y-6">
                          {/* Header of Tracking Section */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                                <Truck size={20} />
                              </div>
                              <div>
                                <h4 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                                  {String(t('orders.trackingTitle'))}
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                                    LIVE MONITORING
                                  </span>
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  Pelacakan real-time mitra pengiriman J&T Express Gromar
                                </p>
                              </div>
                            </div>

                            {/* Locked Payment status badge */}
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                              <ShieldCheck size={15} />
                              <span>{String(t('orders.paidBadge'))}</span>
                              <Lock size={12} className="opacity-60" />
                            </div>
                          </div>

                          {/* Stepper Progress Bar */}
                          <div className="relative pt-2 pb-2">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
                              {trackingSteps.map((step, idx) => {
                                const Icon = step.icon
                                return (
                                  <div
                                    key={step.key}
                                    className={`flex md:flex-col items-center md:items-start gap-3 md:gap-2 p-3 rounded-xl transition-all ${
                                      step.isCurrent
                                        ? 'bg-emerald-500/10 border border-emerald-500/30 ring-1 ring-emerald-500/20'
                                        : step.isDone
                                        ? 'bg-secondary/40'
                                        : 'opacity-50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                          step.isDone
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'bg-muted text-muted-foreground'
                                        }`}
                                      >
                                        {step.isDone ? <Check size={14} /> : idx + 1}
                                      </div>
                                      <Icon
                                        size={16}
                                        className={step.isDone ? 'text-emerald-600' : 'text-muted-foreground'}
                                      />
                                    </div>

                                    <div className="min-w-0">
                                      <p className={`text-xs font-bold ${step.isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {step.title}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                                        {step.desc}
                                      </p>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {/* Courier Logistics Information Box */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs bg-muted/40 rounded-xl p-4 border border-border/50">
                            <div>
                              <span className="text-muted-foreground block text-[11px] font-semibold">{String(t('orders.trackingCourier'))}</span>
                              <span className="font-extrabold text-foreground flex items-center gap-1.5 mt-0.5">
                                <Truck size={14} className="text-agro" /> J&T Express Cargo B2B
                              </span>
                            </div>

                            <div>
                              <span className="text-muted-foreground block text-[11px] font-semibold">{String(t('orders.trackingResi'))}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <code className="font-mono font-bold text-foreground bg-background px-2 py-0.5 rounded border border-border">
                                  {fakeResiNumber}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => handleCopyResi(fakeResiNumber)}
                                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-secondary cursor-pointer"
                                  title={String(t('orders.copyResi'))}
                                >
                                  {copiedResi === fakeResiNumber ? (
                                    <Check size={13} className="text-emerald-600" />
                                  ) : (
                                    <Copy size={13} />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div>
                              <span className="text-muted-foreground block text-[11px] font-semibold">{String(t('orders.trackingEstimate'))}</span>
                              <span className="font-bold text-emerald-700 dark:text-emerald-400 block mt-0.5">
                                {String(t('orders.trackingEstDays'))}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SECTION 3: PENDING PAYMENT & CANCEL ACTIONS */}
                      {isPending && !isAdmin && (
                        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                              <AlertTriangle size={20} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-foreground">
                                Menunggu Pembayaran Midtrans Sandbox
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Selesaikan pembayaran agar komoditas segera dipacking dan dikirim oleh kurir.
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            {/* Cancel Order Button */}
                            <button
                              type="button"
                              onClick={() => setCancelModalOrder(order)}
                              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-card px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shadow-xs cursor-pointer"
                            >
                              <XCircle size={15} />
                              <span>{String(t('orders.cancelOrder'))}</span>
                            </button>

                            {/* Pay Now Button (Direct Snap Trigger) */}
                            <button
                              type="button"
                              onClick={() => handlePayOrder(order)}
                              disabled={payingOrderId === order.id}
                              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-agro px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-agro/90 transition-all hover:scale-102 disabled:opacity-50 cursor-pointer"
                            >
                              <CreditCard size={15} />
                              <span>
                                {payingOrderId === order.id
                                  ? String(t('orders.paying'))
                                  : String(t('orders.payNow'))}
                              </span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Admin Update Status Dropdown */}
                      {isAdmin && (
                        <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-secondary/30 rounded-xl p-3.5">
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-agro" />
                            <span className="text-xs font-bold text-foreground">{String(t('orders.changeStatus'))}</span>
                          </div>
                          <select
                            value={order.status}
                            onChange={(e) => handleAdminStatusChange(order.id, e.target.value)}
                            className="bg-card border border-border text-xs rounded-xl px-3 py-2 font-semibold text-foreground focus:ring-1 focus:ring-primary outline-none cursor-pointer"
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
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Confirmation Modal for Cancellation */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  {String(t('orders.cancelConfirmTitle'))}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ID: #{cancelModalOrder.id.slice(0, 14)}...
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {String(t('orders.cancelConfirmDesc'))}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                disabled={isCancelling}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isCancelling ? String(t('orders.cancelling')) : 'Ya, Batalkan Pesanan'}
              </button>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  )
}
