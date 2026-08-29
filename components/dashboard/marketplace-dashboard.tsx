'use client'

import { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Sprout,
  Waves,
  MapPin,
  ShieldCheck,
  ArrowUpDown,
  FileSignature,
  Trash2,
  Check,
  X,
  FileText,
  TrendingUp,
  Users,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store/auth'
import { contractApi } from '@/lib/api'
import { toast } from 'sonner'
import { CommodityTicker } from '@/components/dashboard/commodity-ticker'
import { B2BCalculator } from '@/components/dashboard/b2b-calculator'
import { BusinessComparison } from '@/components/dashboard/business-comparison'

type Sector = 'agro' | 'marine'

type Product = {
  name: string
  category: string
  region: string
  price: string
  unit: string
  minVolume: string
  image: string
  status: 'Open' | 'Filling fast' | 'Pre-order'
}

const PRODUCTS: Record<Sector, Product[]> = {
  agro: [
    {
      name: 'Premium White Rice',
      category: 'Grains',
      region: 'Karawang, West Java',
      price: 'Rp 11,500',
      unit: 'kg',
      minVolume: '5 tons',
      image: '/agri-rice.png',
      status: 'Open',
    },
    {
      name: 'Arabica Coffee Beans',
      category: 'Coffee',
      region: 'Bali Kintamani',
      price: 'Rp 92,000',
      unit: 'kg',
      minVolume: '500 kg',
      image: '/agri-coffee.png',
      status: 'Filling fast',
    },
    {
      name: 'Fresh Garden Vegetables',
      category: 'Produce',
      region: 'Dieng, Central Java',
      price: 'Rp 8,900',
      unit: 'kg',
      minVolume: '1 ton',
      image: '/agri-vegetables.png',
      status: 'Open',
    },
    {
      name: 'Kitchen Spice Ingredients',
      category: 'Ingredients',
      region: 'Boyolali, Central Java',
      price: 'Rp 24,000',
      unit: 'kg',
      minVolume: '300 kg',
      image: '/agri-ingredients.png',
      status: 'Pre-order',
    },
  ],
  marine: [
    {
      name: 'Fresh Snapper & Tuna',
      category: 'Fish',
      region: 'Makassar, Sulawesi',
      price: 'Rp 58,000',
      unit: 'kg',
      minVolume: '800 kg',
      image: '/marine-fish.png',
      status: 'Open',
    },
    {
      name: 'Wild-Caught Shrimp',
      category: 'Crustacean',
      region: 'Cirebon, West Java',
      price: 'Rp 96,000',
      unit: 'kg',
      minVolume: '400 kg',
      image: '/marine-shrimp.png',
      status: 'Filling fast',
    },
    {
      name: 'Live Mud Crab',
      category: 'Crustacean',
      region: 'Balikpapan, Kalimantan',
      price: 'Rp 130,000',
      unit: 'kg',
      minVolume: '200 kg',
      image: '/marine-crab.png',
      status: 'Open',
    },
    {
      name: 'Fresh Green Seaweed',
      category: 'Sea Vegetable',
      region: 'Nusa Lembongan, Bali',
      price: 'Rp 15,000',
      unit: 'kg',
      minVolume: '1 ton',
      image: '/marine-seaweed.png',
      status: 'Pre-order',
    },
  ],
}

const STATS: Record<Sector, { label: string; value: string; icon: React.ElementType }[]> = {
  agro: [
    { label: 'Active listings', value: '1,240', icon: TrendingUp },
    { label: 'Farmers online', value: '8.6k', icon: Users },
    { label: 'Avg. price lock', value: '90 days', icon: Clock },
  ],
  marine: [
    { label: 'Active listings', value: '870', icon: TrendingUp },
    { label: 'Fishermen online', value: '3.9k', icon: Users },
    { label: 'Avg. price lock', value: '60 days', icon: Clock },
  ],
}

interface ContractRequest {
  id: string
  sector: string
  productName: string
  minVolume: string
  price: string
  region: string
  status: string
  createdAt: string
  user?: {
    name: string
    email: string
  }
}

export function MarketplaceDashboard({
  initialSector = 'agro',
}: {
  initialSector?: Sector
}) {
  const [sector, setSector] = useState<Sector>(initialSector)
  const [query, setQuery] = useState('')
  const { user } = useAuthStore()

  // B2B Contracts State
  const [myContracts, setMyContracts] = useState<ContractRequest[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const isAdminOrSeller = user?.role === 'ADMIN' || user?.role === 'SELLER'

  // Form input states
  const [volume, setVolume] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [customRegion, setCustomRegion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Confirmation Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [confirmTitle, setConfirmTitle] = useState('')
  const [confirmMessage, setConfirmMessage] = useState('')
  const [confirmType, setConfirmType] = useState<'danger' | 'success' | 'info'>('info')
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null)

  // Fetch contracts
  const fetchContracts = async () => {
    if (!user) return
    try {
      const res = await contractApi.getAll()
      setMyContracts(res.data.data)
    } catch (err) {
      console.error('Gagal mengambil data kontrak', err)
    }
  }

  useEffect(() => {
    fetchContracts()
  }, [user])

  const results = useMemo(() => {
    const list = PRODUCTS[sector]
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q),
    )
  }, [sector, query])

  // Open contract request modal
  const handleRequestClick = (product: Product) => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu untuk mengajukan kontrak B2B!')
      return
    }
    setSelectedProduct(product)
    setVolume(product.minVolume)
    setCustomPrice(product.price)
    setCustomRegion(product.region)
    setIsModalOpen(true)
  }

  // Open contract request modal from B2B Calculator
  const handleCalculatorSubmit = (productName: string, calcVolume: string, calcPrice: string) => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu untuk mengajukan kontrak B2B!')
      return
    }
    setSelectedProduct({
      name: productName,
      category: 'Simulasi B2B Bulk',
      region: 'Indonesia (Pusat)',
      price: calcPrice,
      unit: 'kg',
      minVolume: calcVolume,
      image: sector === 'agro' ? '/agri-rice.png' : '/marine-fish.png',
      status: 'Open',
    })
    setVolume(calcVolume)
    setCustomPrice(calcPrice)
    setCustomRegion('Indonesia (Pusat)')
    setIsModalOpen(true)
  }

  // Handle contract submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return
    setIsSubmitting(true)

    try {
      await contractApi.create({
        sector,
        productName: selectedProduct.name,
        minVolume: volume,
        price: customPrice,
        region: customRegion,
      })
      toast.success('Pengajuan kontrak B2B berhasil diajukan!')
      setIsModalOpen(false)
      fetchContracts()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mengajukan kontrak')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete/Cancel contract
  const handleDeleteContract = (id: string) => {
    setConfirmTitle('Batalkan Kontrak?')
    setConfirmMessage('Apakah Anda yakin ingin membatalkan pengajuan kontrak B2B ini? Tindakan ini tidak dapat dibatalkan.')
    setConfirmType('danger')
    setConfirmAction(() => async () => {
      try {
        await contractApi.delete(id)
        toast.success('Kontrak B2B berhasil dibatalkan.')
        fetchContracts()
      } catch (err) {
        toast.error('Gagal membatalkan kontrak.')
      }
    })
    setIsConfirmOpen(true)
  }

  // Admin/Seller: Update Status
  const handleUpdateStatus = (id: string, newStatus: string) => {
    const isApprove = newStatus === 'APPROVED'
    setConfirmTitle(isApprove ? 'Setujui Kontrak B2B?' : 'Tolak Kontrak B2B?')
    setConfirmMessage(
      isApprove
        ? 'Apakah Anda yakin ingin menyetujui pengajuan kontrak B2B ini? Kontrak akan ditandatangani dan dikunci secara resmi.'
        : 'Apakah Anda yakin ingin menolak pengajuan kontrak B2B ini?'
    )
    setConfirmType(isApprove ? 'success' : 'danger')
    setConfirmAction(() => async () => {
      try {
        await contractApi.updateStatus(id, newStatus)
        toast.success(`Status kontrak berhasil diubah menjadi ${newStatus}`)
        fetchContracts()
      } catch (err) {
        toast.error('Gagal memperbarui status kontrak.')
      }
    })
    setIsConfirmOpen(true)
  }

  const accentColor = sector === 'agro' ? 'agro' : 'marine'
  const stats = STATS[sector]

  return (
    <section
      className={`pt-24 transition-colors ${
        sector === 'agro'
          ? 'bg-gradient-to-b from-agro-soft/40 to-background'
          : 'bg-gradient-to-b from-marine-soft/40 to-background'
      }`}
    >
      {/* ── Live Commodity Ticker Band ── */}
      <CommodityTicker />

      {/* ── Dashboard Header Band ── */}
      <div className="relative overflow-hidden border-b border-border h-[420px] flex flex-col justify-end">
        {/* Sector background photo */}
        <Image
          src={sector === 'agro' ? '/agriculture.png' : '/marine.png'}
          alt=""
          fill
          priority
          className="object-cover"
          style={{
            objectPosition: sector === 'agro' ? 'center 18%' : 'center 28%',
          }}
          sizes="100vw"
        />
        {/* Gradient overlay */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            sector === 'agro'
              ? 'bg-gradient-to-r from-[#1a5c2a]/85 via-[#1a5c2a]/55 to-transparent'
              : 'bg-gradient-to-r from-[#0c4a6e]/85 via-[#0c4a6e]/55 to-transparent'
          }`}
        />
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-16 top-8 h-56 w-56 rounded-full bg-white/10 blur-2xl animate-float-slow" />
        <div className="pointer-events-none absolute right-1/3 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl animate-float" />

        {/* Header content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-7xl w-full px-5 sm:px-8 pb-0"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
            <ShieldCheck className="h-4 w-4" />
            {isAdminOrSeller ? 'Smart Contract Management Dashboard' : 'One marketplace · Choose your sector to start'}
          </span>
          <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-4xl lg:text-5xl">
            {isAdminOrSeller ? (
              <>
                Monitoring &amp; Kelola{' '}
                <span className="bg-gradient-to-r from-white via-grain to-white bg-clip-text text-transparent">
                  Kontrak B2B
                </span>
              </>
            ) : (
              <>
                Search &amp; secure{' '}
                <span className="bg-gradient-to-r from-white via-grain to-white bg-clip-text text-transparent">
                  {sector === 'agro' ? 'harvest' : 'catch'} contracts
                </span>
              </>
            )}
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-base leading-relaxed text-white/90 drop-shadow-sm font-medium">
            {isAdminOrSeller
              ? 'Tinjau, setujui, dan awasi pengajuan kontrak suplai pertanian & kelautan berjangka secara realtime.'
              : 'Browse verified producers, lock in fair prices, and sign transparent contracts — all in one place. Switch between land and sea anytime.'}
          </p>

          {/* Sector toggle */}
          <div className="mt-6 inline-flex rounded-full border border-white/30 bg-white/20 p-1 shadow-sm backdrop-blur">
            <button
              type="button"
              onClick={() => setSector('agro')}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                sector === 'agro'
                  ? 'bg-white text-agro shadow-md scale-[1.02]'
                  : 'text-white/90 hover:text-white'
              }`}
              aria-pressed={sector === 'agro'}
            >
              <Sprout className="h-4 w-4" />
              Agriculture
            </button>
            <button
              type="button"
              onClick={() => setSector('marine')}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                sector === 'marine'
                  ? 'bg-white text-marine shadow-md scale-[1.02]'
                  : 'text-white/90 hover:text-white'
              }`}
              aria-pressed={sector === 'marine'}>
              <Waves className="h-4 w-4" />
              Marine
            </button>
          </div>
        </motion.div>

        {/* ── Stats Strip — pinned to bottom of hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mx-auto max-w-7xl w-full px-5 sm:px-8 mt-6"
        >
          <div className="flex gap-px overflow-hidden rounded-t-2xl border border-white/20 bg-white/10 backdrop-blur-md">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className={`flex flex-1 items-center gap-3 px-5 py-3.5 ${
                    i < stats.length - 1 ? 'border-r border-white/20' : ''
                  }`}
                >
                  <Icon className="h-4 w-4 text-white/70 shrink-0" />
                  <div>
                    <p className="text-lg font-extrabold text-white leading-none">{stat.value}</p>
                    <p className="text-[11px] text-white/70 mt-0.5">{stat.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Content Area ── */}
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">

        {/* Catalog Grid (Customer only) */}
        {!isAdminOrSeller && (
          <>
            {/* Interactive B2B Bulk Savings Calculator */}
            <div className="mb-12">
              <B2BCalculator onSelectCommodity={handleCalculatorSubmit} />
            </div>

            {/* Search + sort */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${
                    sector === 'agro' ? 'crops, grains, produce' : 'fish, shrimp, crab'
                  }…`}
                  className={`h-12 w-full rounded-full border border-border bg-card pl-12 pr-4 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-${accentColor}`}
                />
              </div>
              <Button
                variant="outline"
                className="h-12 w-fit rounded-full border-border px-5 font-semibold text-foreground"
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort by price
              </Button>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              {results.length} contract{results.length === 1 ? '' : 's'} available in{' '}
              <span className="font-semibold text-foreground">
                {sector === 'agro' ? 'Agriculture' : 'Marine'}
              </span>
            </p>

            {/* Catalog Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={sector + query}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
              >
                {results.map((p, idx) => (
                  <motion.article
                    key={p.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                  >
                    <div className="relative h-44 w-full overflow-hidden">
                      <Image
                        src={p.image || '/placeholder.svg'}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      />
                      <span
                        className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white ${
                          p.status === 'Filling fast'
                            ? 'bg-grain/90 text-foreground'
                            : sector === 'agro'
                              ? 'bg-agro/90'
                              : 'bg-marine/90'
                        }`}
                      >
                        {p.status}
                      </span>
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                        <ShieldCheck className="h-3 w-3 text-emerald-400" />
                        Verified
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wide ${
                            sector === 'agro' ? 'text-agro' : 'text-marine'
                          }`}
                        >
                          {p.category}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Fixed Price Lock
                        </span>
                      </div>
                      <h3 className="mt-1 text-base font-bold text-foreground leading-snug">
                        {p.name}
                      </h3>
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {p.region}
                      </p>

                      <div className="mt-4 flex items-end justify-between gap-2">
                        <div>
                          <p className="text-lg font-extrabold text-foreground">{p.price}</p>
                          <p className="text-[11px] text-muted-foreground">per {p.unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-muted-foreground">Min. contract</p>
                          <p className="text-sm font-semibold text-foreground">{p.minVolume}</p>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleRequestClick(p)}
                        className={`mt-5 w-full rounded-full font-semibold text-white ${
                          sector === 'agro'
                            ? 'bg-agro hover:bg-agro/90'
                            : 'bg-marine hover:bg-marine/90'
                        }`}
                      >
                        <FileSignature className="mr-2 h-4 w-4" />
                        Request Contract
                      </Button>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </AnimatePresence>

            {results.length === 0 && (
              <div className="mt-10 rounded-3xl border border-dashed border-border bg-secondary/50 py-16 text-center">
                <p className="text-base font-semibold text-foreground">
                  No contracts match &ldquo;{query}&rdquo;
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different keyword or switch sector.
                </p>
              </div>
            )}

            {/* Business Value Proposition Comparison Matrix */}
            <BusinessComparison />
          </>
        )}

        {/* ── B2B Contract List (all logged-in users) ── */}
        {user && (
          <div className={isAdminOrSeller ? 'mt-4' : 'mt-16 pt-12 border-t border-border'}>
            {/* Section header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
              <div>
                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold mb-3 ${
                  sector === 'agro' ? 'bg-agro-soft text-agro' : 'bg-marine-soft text-marine'
                }`}>
                  <FileText className="h-3.5 w-3.5" />
                  {user.role === 'ADMIN' ? 'Platform Monitor' : user.role === 'SELLER' ? 'Persetujuan Masuk' : 'Kontrak Saya'}
                </div>
                <h2 className="text-2xl font-extrabold text-foreground">
                  {user.role === 'ADMIN' ? 'Monitoring Kontrak B2B Platform' :
                   user.role === 'SELLER' ? 'Persetujuan Kontrak B2B Masuk' :
                   'Daftar Kontrak B2B Saya'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {user.role === 'ADMIN' ? 'Pantau seluruh riwayat transaksi dan status kontrak pintar yang berjalan di platform Gromar.' :
                   user.role === 'SELLER' ? 'Tinjau penawaran harga & volume dari pembeli. Setujui untuk mengunci kontrak.' :
                   'Kelola pengajuan kontrak suplai pertanian dan hasil laut berjangka Anda.'}
                </p>
              </div>

              {/* Contract count badge */}
              {myContracts.length > 0 && (
                <span className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-foreground shadow-sm">
                  {myContracts.length} kontrak
                </span>
              )}
            </div>

            {myContracts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card py-16 text-center">
                <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-semibold text-foreground">Belum ada kontrak</p>
                <p className="mt-1 max-w-sm mx-auto text-sm text-muted-foreground">
                  {user.role === 'CUSTOMER'
                    ? 'Klik "Request Contract" di salah satu katalog di atas untuk memulai.'
                    : 'Belum ada pengajuan kontrak B2B masuk di platform.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {myContracts.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col justify-between rounded-3xl border border-border bg-card shadow-sm overflow-hidden"
                  >
                    {/* Card top accent bar by sector */}
                    <div className={`h-1 w-full ${c.sector === 'agro' ? 'bg-agro' : 'bg-marine'}`} />

                    <div className="p-5">
                      {/* Header row */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-extrabold rounded-full px-2.5 py-1 ${
                          c.sector === 'agro' ? 'bg-agro-soft text-agro' : 'bg-marine-soft text-marine'
                        }`}>
                          {c.sector === 'agro' ? <Sprout className="h-3 w-3" /> : <Waves className="h-3 w-3" />}
                          {c.sector === 'agro' ? 'Agriculture' : 'Marine'}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          c.status === 'APPROVED'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : c.status === 'REJECTED'
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                          {c.status === 'APPROVED' ? 'Disetujui' : c.status === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                        </span>
                      </div>

                      {/* Product name */}
                      <h3 className="text-base font-bold text-foreground">{c.productName}</h3>

                      {/* Details grid */}
                      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                        <div>
                          <p className="text-muted-foreground">Volume Kontrak</p>
                          <p className="font-semibold text-foreground mt-0.5">{c.minVolume}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Harga Terkunci</p>
                          <p className="font-semibold text-foreground mt-0.5">{c.price}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Wilayah Asal</p>
                          <p className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                            <MapPin size={11} className="text-muted-foreground shrink-0" />
                            {c.region}
                          </p>
                        </div>
                        {user.role === 'ADMIN' && c.user && (
                          <div className="col-span-2 rounded-xl bg-secondary px-3 py-2">
                            <p className="text-muted-foreground text-[10px]">Pengaju</p>
                            <p className="font-bold text-foreground text-xs mt-0.5">
                              {c.user.name}{' '}
                              <span className="font-normal text-muted-foreground">({c.user.email})</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-5 pb-5 flex gap-2 justify-end border-t border-border/50 pt-4">
                      {/* Seller/Admin approve/reject */}
                      {(user.role === 'ADMIN' || user.role === 'SELLER') && c.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(c.id, 'APPROVED')}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-full font-bold px-4 text-xs cursor-pointer"
                          >
                            <Check size={13} className="mr-1" /> Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateStatus(c.id, 'REJECTED')}
                            className="rounded-full font-bold px-4 text-xs cursor-pointer"
                          >
                            <X size={13} className="mr-1" /> Tolak
                          </Button>
                        </>
                      )}

                      {/* Cancel/Delete */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteContract(c.id)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full font-bold px-4 text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        Batal
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── B2B Contract Request Modal ── */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary text-muted-foreground transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 font-bold">
              <FileSignature size={20} className={sector === 'agro' ? 'text-agro' : 'text-marine'} />
              <span className="text-sm text-muted-foreground">Pengajuan Kontrak B2B</span>
            </div>

            <h3 className="text-xl font-extrabold text-foreground mt-2">{selectedProduct.name}</h3>
            <p className="text-muted-foreground text-xs mt-1">
              Kunci volume panen/tangkapan langsung dengan produsen di wilayah {selectedProduct.region}.
            </p>

            <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Volume Pasokan yang Diinginkan</label>
                <input
                  type="text"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-full h-10 border border-border rounded-xl px-3 text-sm bg-background text-foreground outline-none focus:border-agro transition-colors"
                  placeholder="Contoh: 10 tons, 500 kg"
                  required
                />
                <span className="text-[11px] text-muted-foreground block">
                  Minimal Pengajuan: {selectedProduct.minVolume}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Harga Penawaran per {selectedProduct.unit}</label>
                <input
                  type="text"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full h-10 border border-border rounded-xl px-3 text-sm bg-background text-foreground outline-none focus:border-agro transition-colors"
                  placeholder="Contoh: Rp 12,000"
                  required
                />
                <span className="text-[11px] text-muted-foreground block">
                  Acuan Pasar: {selectedProduct.price} / {selectedProduct.unit}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Wilayah Distribusi</label>
                <input
                  type="text"
                  value={customRegion}
                  onChange={(e) => setCustomRegion(e.target.value)}
                  className="w-full h-10 border border-border rounded-xl px-3 text-sm bg-background text-foreground outline-none focus:border-agro transition-colors"
                  placeholder="Asal daerah produsen"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 rounded-full font-bold h-11 border-border cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-1/2 rounded-full font-bold h-11 text-white cursor-pointer ${
                    sector === 'agro' ? 'bg-agro hover:bg-agro/90' : 'bg-marine hover:bg-marine/90'
                  }`}
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-center">
            <div className={`mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4 ${
              confirmType === 'danger' ? 'bg-red-100 text-red-600' :
              confirmType === 'success' ? 'bg-green-100 text-green-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {confirmType === 'danger' ? <Trash2 size={24} /> :
               confirmType === 'success' ? <Check size={24} /> :
               <FileSignature size={24} />}
            </div>

            <h3 className="text-lg font-extrabold text-foreground">{confirmTitle}</h3>
            <p className="text-muted-foreground text-sm mt-2 px-2 leading-relaxed">
              {confirmMessage}
            </p>

            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmOpen(false)}
                className="w-1/2 rounded-full font-bold h-10 border-border cursor-pointer"
              >
                Kembali
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  if (confirmAction) {
                    await confirmAction()
                  }
                  setIsConfirmOpen(false)
                }}
                className={`w-1/2 rounded-full font-bold h-10 text-white cursor-pointer ${
                  confirmType === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                  confirmType === 'success' ? 'bg-green-600 hover:bg-green-700' :
                  'bg-primary hover:bg-primary/90'
                }`}
              >
                Ya, Lanjutkan
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
