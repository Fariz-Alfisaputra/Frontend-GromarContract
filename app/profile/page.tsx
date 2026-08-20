'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { useAuthStore } from '@/lib/store/auth'
import { useCartStore } from '@/lib/store/cart'
import { orderApi } from '@/lib/api'
import { toast } from 'sonner'
import {
  User,
  Mail,
  ShieldCheck,
  Package,
  FileText,
  ShoppingBag,
  LogOut,
  ChevronRight,
  Sprout,
  Waves,
  Star,
  Edit3,
  Check,
  X,
  Lock,
} from 'lucide-react'

interface OrderSummary {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  items: { quantity: number; product: { name: string } }[]
}

const ROLE_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  CUSTOMER: { label: 'Pembeli', color: 'text-agro', bg: 'bg-agro-soft', icon: ShoppingBag },
  SELLER:   { label: 'Penjual', color: 'text-marine', bg: 'bg-marine-soft', icon: Sprout },
  ADMIN:    { label: 'Administrator', color: 'text-grain', bg: 'bg-grain/10', icon: ShieldCheck },
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { count, clearLocal } = useCartStore()

  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)

  // Edit name state
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    setEditName(user.name)
    fetchOrders()
  }, [user])

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getAll()
      setOrders(res.data.data ?? [])
    } catch {
      setOrders([])
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const handleLogout = () => {
    clearLocal()
    logout()
    router.push('/')
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  if (!user) return null

  const role = ROLE_META[user.role] ?? ROLE_META['CUSTOMER']
  const RoleIcon = role.icon

  const totalSpent = orders
    .filter((o) => o.status === 'PAID')
    .reduce((sum, o) => sum + o.totalAmount, 0)

  const statusColor: Record<string, string> = {
    PAID:       'bg-green-100 text-green-700',
    PENDING:    'bg-yellow-100 text-yellow-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    CANCELLED:  'bg-red-100 text-red-700',
    SHIPPED:    'bg-purple-100 text-purple-700',
  }

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-gradient-to-b from-agro-soft/30 to-background">
      <SiteHeader />

      {/* ── Hero band ── */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-r from-[#1a5c2a]/90 via-[#1a5c2a]/70 to-[#1565c0]/60 pt-24 pb-28">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

        <div className="relative mx-auto max-w-4xl px-5 sm:px-8">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-end sm:text-left">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 text-3xl font-extrabold text-white ring-4 ring-white/30 backdrop-blur-sm sm:h-28 sm:w-28 sm:text-4xl">
                {initials}
              </div>
              <span className={`absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full ${role.bg} ring-2 ring-background`}>
                <RoleIcon size={14} className={role.color} />
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              {/* Editable name */}
              {isEditingName ? (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-9 rounded-xl border border-white/30 bg-white/20 px-3 text-white placeholder:text-white/60 outline-none backdrop-blur-sm text-lg font-bold w-48 sm:w-64"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      toast.info('Edit nama belum tersedia di API saat ini.')
                      setIsEditingName(false)
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 cursor-pointer"
                  >
                    <Check size={15} />
                  </button>
                  <button
                    onClick={() => { setIsEditingName(false); setEditName(user.name) }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="group flex items-center gap-2 text-2xl sm:text-3xl font-extrabold text-white justify-center sm:justify-start cursor-pointer"
                >
                  {user.name}
                  <Edit3 size={16} className="opacity-0 group-hover:opacity-70 transition-opacity mt-1" />
                </button>
              )}

              <p className="mt-1 text-white/80 text-sm">{user.email}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${role.bg} ${role.color}`}>
                  <RoleIcon size={12} />
                  {role.label}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  <ShieldCheck size={12} />
                  Akun Terverifikasi
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-red-500/40 cursor-pointer"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div className="-mt-8 flex overflow-hidden rounded-2xl border border-border bg-card shadow-md">
          {[
            { label: 'Total Pesanan', value: orders.length.toString(), icon: Package },
            { label: 'Sudah Dibayar', value: orders.filter(o => o.status === 'PAID').length.toString(), icon: Check },
            { label: 'Total Belanja', value: formatPrice(totalSpent), icon: ShoppingBag },
            { label: 'Item di Keranjang', value: count.toString(), icon: ShoppingBag },
          ].map((stat, i, arr) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className={`flex flex-1 flex-col items-center justify-center gap-1 px-3 py-4 text-center ${i < arr.length - 1 ? 'border-r border-border' : ''}`}
              >
                <p className="text-sm font-extrabold text-foreground sm:text-base">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground sm:text-xs leading-tight">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 pb-20">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

          {/* Left: Recent orders */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-foreground">Riwayat Pesanan</h2>
              <Link
                href="/orders"
                className="flex items-center gap-1 text-sm font-semibold text-agro hover:underline"
              >
                Lihat Semua <ChevronRight size={15} />
              </Link>
            </div>

            {isLoadingOrders ? (
              <div className="flex flex-col gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 rounded-2xl bg-secondary animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-14 text-center">
                <Package size={40} className="text-muted-foreground mb-3" />
                <p className="font-semibold text-foreground">Belum ada pesanan</p>
                <p className="mt-1 text-sm text-muted-foreground">Mulai belanja produk segar di Toko Gromar</p>
                <Link
                  href="/shop"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-agro px-5 py-2.5 text-sm font-bold text-white hover:bg-agro/90 transition-colors"
                >
                  Ke Toko Segar
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="rounded-lg bg-secondary px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
                          #{order.id.slice(-8).toUpperCase()}
                        </code>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusColor[order.status] ?? 'bg-secondary text-muted-foreground'}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {order.items?.map(i => i.product?.name).filter(Boolean).join(', ') || '—'}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                    <p className="text-base font-extrabold text-foreground sm:text-right shrink-0">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                ))}
                {orders.length > 5 && (
                  <Link
                    href="/orders"
                    className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card py-3 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    Lihat {orders.length - 5} pesanan lainnya <ChevronRight size={15} />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right: Quick actions + account info */}
          <div className="flex flex-col gap-5">

            {/* Account info */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-extrabold text-foreground uppercase tracking-wide">Detail Akun</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-agro-soft">
                    <User size={15} className="text-agro" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Nama Lengkap</p>
                    <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-agro-soft">
                    <Mail size={15} className="text-agro" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Email</p>
                    <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-agro-soft">
                    <RoleIcon size={15} className="text-agro" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Peran</p>
                    <p className="text-sm font-semibold text-foreground">{role.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-agro-soft">
                    <Lock size={15} className="text-agro" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Password</p>
                    <p className="text-sm font-semibold text-muted-foreground tracking-widest">••••••••</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-extrabold text-foreground uppercase tracking-wide">Aksi Cepat</h3>
              <div className="flex flex-col gap-1">
                {[
                  { label: 'Toko Segar', desc: 'Beli produk segar', href: '/shop', icon: ShoppingBag, color: 'text-agro', bg: 'bg-agro-soft' },
                  { label: 'Kontrak B2B', desc: 'Kelola kontrak suplai', href: '/dashboard', icon: FileText, color: 'text-marine', bg: 'bg-marine-soft' },
                  { label: 'Pesanan Saya', desc: 'Riwayat transaksi', href: '/orders', icon: Package, color: 'text-grain', bg: 'bg-grain/10' },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm transition-colors hover:bg-secondary group"
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${item.bg}`}>
                        <Icon size={15} className={item.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                      </div>
                      <ChevronRight size={15} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Loyalty card (dekoratif) */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a5c2a] to-[#1565c0] p-5 text-white shadow-sm">
              <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-white/10 blur-xl" />
              <div className="relative">
                <div className="mb-3 flex items-center gap-2">
                  <Star size={16} className="text-grain fill-grain" />
                  <span className="text-xs font-bold uppercase tracking-wide opacity-80">Gromar Member</span>
                </div>
                <p className="text-lg font-extrabold">{user.name}</p>
                <p className="mt-0.5 text-xs opacity-70">{user.email}</p>
                <div className="mt-4 flex items-center gap-2">
                  {user.role === 'CUSTOMER' && <Sprout size={14} className="opacity-60" />}
                  {user.role === 'SELLER' && <Waves size={14} className="opacity-60" />}
                  {user.role === 'ADMIN' && <ShieldCheck size={14} className="opacity-60" />}
                  <span className="text-xs font-semibold opacity-80">{role.label}</span>
                </div>
              </div>
            </div>

            {/* Mobile logout */}
            <button
              onClick={handleLogout}
              className="flex sm:hidden w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 cursor-pointer"
            >
              <LogOut size={16} /> Keluar dari Akun
            </button>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
