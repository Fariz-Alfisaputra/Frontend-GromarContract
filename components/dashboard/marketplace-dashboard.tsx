'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
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
  ChevronDown,
  Calculator,
  UploadCloud,
  FileCheck,
  Printer,
  Download,
  Building2,
  Phone,
  Calendar,
  AlertCircle,
  ExternalLink,
  Lock,
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store/auth'
import { useTranslation } from '@/lib/i18n/use-translation'
import { contractApi, uploadApi } from '@/lib/api'
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

type ContractItem = {
  id: string
  sector: 'agro' | 'marine'
  productName: string
  minVolume: string
  price: string
  region: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  companyName?: string
  nibOrNik?: string
  picContact?: string
  supplyDuration?: string
  documentUrl?: string
  buyerNotes?: string
  contractNumber?: string
  user?: {
    name: string
    email: string
    role?: string
  }
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
      image: '/agri-rice.webp',
      status: 'Open',
    },
    {
      name: 'Arabica Coffee Beans',
      category: 'Coffee',
      region: 'Bali Kintamani',
      price: 'Rp 92,000',
      unit: 'kg',
      minVolume: '500 kg',
      image: '/agri-coffee.webp',
      status: 'Filling fast',
    },
    {
      name: 'Fresh Garden Vegetables',
      category: 'Produce',
      region: 'Dieng, Central Java',
      price: 'Rp 8,900',
      unit: 'kg',
      minVolume: '1 ton',
      image: '/agri-vegetables.webp',
      status: 'Open',
    },
    {
      name: 'Kitchen Spice Ingredients',
      category: 'Ingredients',
      region: 'Boyolali, Central Java',
      price: 'Rp 24,000',
      unit: 'kg',
      minVolume: '300 kg',
      image: '/agri-ingredients.webp',
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
      image: '/marine-fish.webp',
      status: 'Open',
    },
    {
      name: 'Black Tiger Shrimp',
      category: 'Crustaceans',
      region: 'Tarakan, North Kalimantan',
      price: 'Rp 125,000',
      unit: 'kg',
      minVolume: '300 kg',
      image: '/marine-shrimp.webp',
      status: 'Filling fast',
    },
    {
      name: 'Dried Eucheuma Seaweed',
      category: 'Seaweed',
      region: 'Sumbawa, NTB',
      price: 'Rp 18,500',
      unit: 'kg',
      minVolume: '2 tons',
      image: '/marine-seaweed.webp',
      status: 'Open',
    },
    {
      name: 'Mud Crab Live / Frozen',
      category: 'Crustaceans',
      region: 'Papua & Maluku',
      price: 'Rp 145,000',
      unit: 'kg',
      minVolume: '200 kg',
      image: '/marine-crab.webp',
      status: 'Pre-order',
    },
  ],
}

const STATS = {
  agro: {
    activeListings: '2,400+',
    onlineProducers: '1,180 Petani Online',
    avgPriceLock: '8.4 Bulan Kunci Harga',
  },
  marine: {
    activeListings: '1,850+',
    onlineProducers: '920 Nelayan Online',
    avgPriceLock: '6.2 Bulan Kunci Harga',
  },
}

export function MarketplaceDashboard({
  initialSector = 'agro',
}: {
  initialSector?: Sector
}) {
  const [sector, setSector] = useState<Sector>(initialSector)
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default')
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const router = useRouter()

  // B2B Contracts State
  const [myContracts, setMyContracts] = useState<ContractItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false)
  const isAdminOrSeller = user?.role === 'ADMIN' || user?.role === 'SELLER'

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
      setMyContracts(res.data.data || [])
    } catch (err) {
      console.error('Gagal mengambil data kontrak', err)
    }
  }

  useEffect(() => {
    fetchContracts()
  }, [user])

  const results = useMemo(() => {
    let list = [...PRODUCTS[sector]]
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.region.toLowerCase().includes(q),
      )
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => {
        const numA = parseInt(a.price.replace(/[^0-9]/g, ''), 10) || 0
        const numB = parseInt(b.price.replace(/[^0-9]/g, ''), 10) || 0
        return numA - numB
      })
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => {
        const numA = parseInt(a.price.replace(/[^0-9]/g, ''), 10) || 0
        const numB = parseInt(b.price.replace(/[^0-9]/g, ''), 10) || 0
        return numB - numA
      })
    }

    return list
  }, [sector, query, sortBy])

  // Open contract request page
  const handleRequestClick = (product: Product) => {
    if (!user) {
      toast.error(String(t('contract.loginFirst')))
      return
    }
    router.push(
      `/contract/new?product=${encodeURIComponent(product.name)}&sector=${sector}&region=${encodeURIComponent(product.region)}&price=${encodeURIComponent(product.price)}&unit=${encodeURIComponent(product.unit)}&minVolume=${encodeURIComponent(product.minVolume)}`
    )
  }

  // Open contract request page from B2B Calculator
  const handleCalculatorSubmit = (productName: string, calcVolume: string, calcPrice: string) => {
    if (!user) {
      toast.error(String(t('contract.loginFirst')))
      return
    }
    router.push(
      `/contract/new?product=${encodeURIComponent(productName)}&sector=${sector}&region=${encodeURIComponent('Indonesia (Pusat)')}&price=${encodeURIComponent(calcPrice)}&unit=${encodeURIComponent('kg')}&minVolume=${encodeURIComponent(calcVolume)}`
    )
  }



  // Delete/Cancel contract
  const handleDeleteContract = (id: string) => {
    setConfirmTitle(String(t('contract.cancelContractTitle')))
    setConfirmMessage(String(t('contract.cancelContractMessage')))
    setConfirmType('danger')
    setConfirmAction(() => async () => {
      try {
        await contractApi.delete(id)
        toast.success(String(t('contract.cancelSuccess')))
        fetchContracts()
      } catch (err) {
        toast.error(String(t('contract.cancelFail')))
      }
    })
    setIsConfirmOpen(true)
  }

  // Admin/Seller: Update Status & ACC
  const handleUpdateStatus = (id: string, newStatus: string) => {
    const isApprove = newStatus === 'APPROVED'
    setConfirmTitle(isApprove ? String(t('contract.approveContractTitle')) : String(t('contract.rejectContractTitle')))
    setConfirmMessage(
      isApprove
        ? String(t('contract.approveContractMessage'))
        : String(t('contract.rejectContractMessage'))
    )
    setConfirmType(isApprove ? 'success' : 'danger')
    setConfirmAction(() => async () => {
      try {
        await contractApi.updateStatus(id, newStatus)
        toast.success(
          String(t('contract.statusUpdated')).replace(
            '{status}',
            newStatus === 'APPROVED'
              ? String(t('contract.statusApproved'))
              : String(t('contract.statusRejected'))
          )
        )
        setIsDocViewerOpen(false)
        fetchContracts()
      } catch (err) {
        toast.error(String(t('contract.updateStatusFail')))
      }
    })
    setIsConfirmOpen(true)
  }

  // Open Document Viewer Page
  const handleOpenDocViewer = (contract: ContractItem, isReview = false) => {
    router.push(`/contract/${contract.id}${isReview ? '?review=true' : ''}`)
  }

  // Print Document
  const handlePrintDocument = () => {
    window.print()
  }

  const statusLabel: Record<string, string> = {
    Open: String(t('contract.statusOpen')),
    'Filling fast': String(t('contract.statusFillingFast')),
    'Pre-order': String(t('contract.statusPreOrder')),
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
          src={sector === 'agro' ? '/agriculture.webp' : '/marine.webp'}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.35]"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold mb-3 border border-white/20">
                <ShieldCheck size={14} />
                <span>{user?.role === 'ADMIN' ? String(t('contract.heroBadgeAdmin')) : String(t('contract.heroBadgeGuest'))}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                {user?.role === 'ADMIN' ? (
                  <>
                    {String(t('contract.titleAdminManage'))} <span className="text-white">{String(t('contract.titleAdminContract'))}</span>
                  </>
                ) : (
                  <>
                    {String(t('contract.titleGuestSearch'))}{' '}
                    <span className="text-white">
                      {sector === 'agro' ? String(t('contract.titleGuestHarvest')) : String(t('contract.titleGuestCatch'))}
                    </span>{' '}
                    {String(t('contract.titleGuestContracts'))}
                  </>
                )}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-white/90 max-w-2xl">
                {user?.role === 'ADMIN'
                  ? String(t('contract.subtitleAdmin'))
                  : String(t('contract.subtitleGuest'))}
              </p>
            </div>

            {/* Sector Switcher Pill */}
            <div className="flex bg-black/40 backdrop-blur-xl p-1.5 rounded-2xl border border-white/20 self-start md:self-auto shrink-0 shadow-xl">
              <button
                type="button"
                onClick={() => setSector('agro')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  sector === 'agro'
                    ? 'bg-agro text-white shadow-lg shadow-agro/30 scale-102'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sprout size={16} />
                <span>{String(t('contract.sectorAgriculture'))}</span>
              </button>
              <button
                type="button"
                onClick={() => setSector('marine')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  sector === 'marine'
                    ? 'bg-marine text-white shadow-lg shadow-marine/30 scale-102'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Waves size={16} />
                <span>{String(t('contract.sectorMarine'))}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Metric Snapshot Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${sector === 'agro' ? 'bg-agro/10 text-agro' : 'bg-marine/10 text-marine'}`}>
              <Layers size={22} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{String(t('contract.statActiveListings'))}</p>
              <h4 className="text-xl font-extrabold text-foreground">{stats.activeListings}</h4>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${sector === 'agro' ? 'bg-agro/10 text-agro' : 'bg-marine/10 text-marine'}`}>
              <Users size={22} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                {sector === 'agro' ? String(t('contract.statFarmersOnline')) : String(t('contract.statFishermenOnline'))}
              </p>
              <h4 className="text-xl font-extrabold text-foreground">{stats.onlineProducers}</h4>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${sector === 'agro' ? 'bg-agro/10 text-agro' : 'bg-marine/10 text-marine'}`}>
              <Clock size={22} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{String(t('contract.statAvgPriceLock'))}</p>
              <h4 className="text-xl font-extrabold text-foreground">{stats.avgPriceLock}</h4>
            </div>
          </div>
        </div>

        {/* ── Search & Filter Toolbar ── */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm mb-8 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={sector === 'agro' ? String(t('contract.searchAgro')) : String(t('contract.searchMarine'))}
              className="w-full h-10 pl-9 pr-4 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-agro transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <ArrowUpDown size={14} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="default">{String(t('contract.sortByPrice'))} (Default)</option>
                <option value="price-asc">Harga: Rendah ke Tinggi</option>
                <option value="price-desc">Harga: Tinggi ke Rendah</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Commodity Listings Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {results.map((product) => {
            return (
              <div
                key={product.name}
                className="group bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Product Image */}
                  <div className="relative h-44 w-full overflow-hidden bg-secondary">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-md">
                        {statusLabel[product.status] || product.status}
                      </span>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full text-white backdrop-blur-md ${
                        sector === 'agro' ? 'bg-agro/90' : 'bg-marine/90'
                      }`}>
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Info Content */}
                  <div className="p-4 sm:p-5">
                    <h3 className="font-extrabold text-foreground text-base group-hover:text-agro transition-colors line-clamp-1">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                      <MapPin size={13} className="text-muted-foreground shrink-0" />
                      <span className="truncate">{product.region}</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase block">{String(t('contract.fixedPriceLock'))}</span>
                        <span className="text-base font-extrabold text-foreground">
                          {product.price} <span className="text-xs font-normal text-muted-foreground">/{product.unit}</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase block">{String(t('contract.minContract'))}</span>
                        <span className="text-xs font-bold text-foreground">{product.minVolume}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Request Contract Button */}
                <div className="p-4 sm:p-5 pt-0">
                  <Button
                    onClick={() => handleRequestClick(product)}
                    className={`w-full rounded-2xl font-bold text-xs h-10 text-white shadow-sm hover:scale-102 transition-all cursor-pointer ${
                      sector === 'agro' ? 'bg-agro hover:bg-agro/90' : 'bg-marine hover:bg-marine/90'
                    }`}
                  >
                    <FileSignature size={15} className="mr-1.5" />
                    <span>{String(t('contract.requestContract'))}</span>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── B2B Supply Cost Calculator Section ── */}
        <div className="mb-14">
          <B2BCalculator onSelectCommodity={handleCalculatorSubmit} />
        </div>

        {/* ── Business Comparison Section ── */}
        <div className="mb-14">
          <BusinessComparison />
        </div>

        {/* ── Active Contracts Management Section ── */}
        {user && (
          <div className="mt-12 bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    sector === 'agro' ? 'bg-agro/10 text-agro' : 'bg-marine/10 text-marine'
                  }`}>
                    {user.role === 'ADMIN'
                      ? String(t('contract.sectionAdminBadge'))
                      : user.role === 'SELLER'
                      ? String(t('contract.sectionSellerBadge'))
                      : String(t('contract.sectionCustomerBadge'))}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight mt-1">
                  {user.role === 'ADMIN'
                    ? String(t('contract.sectionAdminTitle'))
                    : user.role === 'SELLER'
                    ? String(t('contract.sectionSellerTitle'))
                    : String(t('contract.sectionCustomerTitle'))}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {user.role === 'ADMIN'
                    ? String(t('contract.sectionAdminDesc'))
                    : user.role === 'SELLER'
                    ? String(t('contract.sectionSellerDesc'))
                    : String(t('contract.sectionCustomerDesc'))}
                </p>
              </div>

              {myContracts.length > 0 && (
                <span className="shrink-0 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-bold text-foreground">
                  {myContracts.length} Dokumen Kontrak
                </span>
              )}
            </div>

            {myContracts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card py-16 text-center">
                <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-semibold text-foreground">{String(t('contract.noContracts'))}</p>
                <p className="mt-1 max-w-sm mx-auto text-xs sm:text-sm text-muted-foreground">
                  {user.role === 'CUSTOMER'
                    ? String(t('contract.noContractsCustomerHint'))
                    : String(t('contract.noContractsAdminHint'))}
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {myContracts.map((c) => {
                  const isAgro = c.sector === 'agro'
                  const isApproved = c.status === 'APPROVED'
                  const isRejected = c.status === 'REJECTED'
                  const isPending = c.status === 'PENDING'
                  const spkNumber = `SPK-GRM/${c.sector.toUpperCase()}/${c.id.slice(0, 8).toUpperCase()}`

                  return (
                    <div
                      key={c.id}
                      className="rounded-3xl border border-border bg-card shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                    >
                      {/* Accent Header */}
                      <div className={`h-1.5 w-full ${isAgro ? 'bg-agro' : 'bg-marine'}`} />

                      <div className="p-5 sm:p-6 space-y-4">
                        {/* Top Meta */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold rounded-full px-2.5 py-0.5 ${
                              isAgro ? 'bg-agro/10 text-agro' : 'bg-marine/10 text-marine'
                            }`}>
                              {isAgro ? <Sprout className="h-3 w-3" /> : <Waves className="h-3 w-3" />}
                              {isAgro ? String(t('contract.sectorAgriculture')) : String(t('contract.sectorMarine'))}
                            </span>
                            <code className="text-[11px] font-mono font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                              #{spkNumber}
                            </code>
                          </div>

                          <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${
                            isApproved
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                              : isRejected
                              ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          }`}>
                            {isApproved
                              ? String(t('contract.statusApproved'))
                              : isRejected
                              ? String(t('contract.statusRejected'))
                              : String(t('contract.statusPending'))}
                          </span>
                        </div>

                        {/* Product Title */}
                        <div>
                          <h3 className="text-lg font-extrabold text-foreground">{c.productName}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Badan Usaha / Pengaju: <strong className="text-foreground">{c.companyName || c.user?.name || 'Perusahaan Terverifikasi'}</strong>
                          </p>
                        </div>

                        {/* Dual-Party Mutual ACC Status Badges */}
                        <div className="bg-secondary/40 rounded-2xl p-3.5 space-y-2 border border-border/50 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground font-medium">Pihak I (Pembeli):</span>
                            <span className="font-bold text-emerald-600 flex items-center gap-1">
                              <Check size={13} /> {String(t('contract.buyerAccBadge'))}
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-t border-border/40 pt-2">
                            <span className="text-muted-foreground font-medium">Pihak II (Penyedia):</span>
                            <span className={`font-bold flex items-center gap-1 ${
                              isApproved
                                ? 'text-emerald-600'
                                : isRejected
                                ? 'text-rose-600'
                                : 'text-amber-600'
                            }`}>
                              {isApproved ? (
                                <>
                                  <Check size={13} /> {String(t('contract.sellerAccApproved'))}
                                </>
                              ) : isRejected ? (
                                <>
                                  <X size={13} /> {String(t('contract.sellerAccRejected'))}
                                </>
                              ) : (
                                <>
                                  <Clock size={13} /> {String(t('contract.sellerAccWaiting'))}
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                          <div>
                            <span className="text-muted-foreground block text-[11px]">{String(t('contract.volumeContract'))}</span>
                            <span className="font-bold text-foreground">{c.minVolume}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[11px]">{String(t('contract.lockedPrice'))}</span>
                            <span className="font-bold text-foreground">{c.price}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[11px]">{String(t('contract.originRegion'))}</span>
                            <span className="font-semibold text-foreground flex items-center gap-1 truncate">
                              <MapPin size={11} className="text-muted-foreground shrink-0" /> {c.region}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[11px]">Durasi Kontrak</span>
                            <span className="font-semibold text-foreground truncate block">
                              {c.supplyDuration || '3 Bulan Rutin'}
                            </span>
                          </div>
                        </div>

                        {/* Uploaded PDF Lampiran badge if exists */}
                        {c.documentUrl && (
                          <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-xs border border-border/50">
                            <FileCheck size={15} className="text-agro shrink-0" />
                            <span className="text-muted-foreground truncate">Lampiran Scan Basah / PDF terverifikasi</span>
                          </div>
                        )}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="p-4 sm:p-5 pt-0 border-t border-border/40 mt-2 flex flex-wrap items-center justify-between gap-2">
                        {/* View Legal Agreement Document */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDocViewer(c, false)}
                          className="rounded-xl font-bold text-xs border-border hover:bg-secondary cursor-pointer"
                        >
                          <FileText size={14} className="mr-1.5 text-agro" />
                          <span>{String(t('contract.viewDocButton'))}</span>
                        </Button>

                        <div className="flex items-center gap-2">
                          {/* Seller / Admin: Review & ACC */}
                          {isAdminOrSeller && isPending && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenDocViewer(c, true)}
                              className="rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
                            >
                              <ShieldCheck size={14} className="mr-1.5" />
                              <span>{String(t('contract.reviewAndAccButton'))}</span>
                            </Button>
                          )}

                          {/* Customer / Owner delete option if pending */}
                          {isPending && (user.role === 'ADMIN' || c.user?.email === user.email) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteContract(c.id)}
                              className="h-9 w-9 p-0 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                              title="Batalkan Dokumen Kontrak"
                            >
                              <Trash2 size={15} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════════════
          MULTI-STEP LEGAL CONTRACT CREATION MODAL
      ═══════════════════════════════════════════════════════════════════════════════════ */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary text-muted-foreground transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2.5 font-bold">
              <div className={`p-2 rounded-xl ${sector === 'agro' ? 'bg-agro/10 text-agro' : 'bg-marine/10 text-marine'}`}>
                <FileSignature size={20} />
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-extrabold">
                  {String(t('contract.modalTitle'))}
                </span>
                <h3 className="text-xl font-extrabold text-foreground">{selectedProduct.name}</h3>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-3 gap-2 my-5 pt-2 border-t border-border/60">
              {[
                { step: 1, title: String(t('contract.step1Title')) },
                { step: 2, title: String(t('contract.step2Title')) },
                { step: 3, title: String(t('contract.step3Title')) },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`p-2 rounded-xl text-center border text-xs font-bold transition-all ${
                    modalStep === s.step
                      ? 'bg-agro text-white border-agro shadow-xs'
                      : modalStep > s.step
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-secondary/40 text-muted-foreground border-border/50'
                  }`}
                >
                  {s.title}
                </div>
              ))}
            </div>

            <form onSubmit={handleFormSubmit}>
              {/* STEP 1: SUPPLY DETAILS & LEGALITY */}
              {modalStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">{String(t('contract.companyNameLabel'))}</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full h-10 border border-border rounded-xl px-3 text-xs sm:text-sm bg-background text-foreground outline-none focus:border-agro"
                        placeholder={String(t('contract.companyNamePlaceholder'))}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">{String(t('contract.nibOrNikLabel'))}</label>
                      <input
                        type="text"
                        value={nibOrNik}
                        onChange={(e) => setNibOrNik(e.target.value)}
                        className="w-full h-10 border border-border rounded-xl px-3 text-xs sm:text-sm bg-background text-foreground outline-none focus:border-agro"
                        placeholder={String(t('contract.nibOrNikPlaceholder'))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">{String(t('contract.volumeLabel'))}</label>
                      <input
                        type="text"
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                        className="w-full h-10 border border-border rounded-xl px-3 text-xs sm:text-sm bg-background text-foreground outline-none focus:border-agro"
                        placeholder={String(t('contract.volumePlaceholder'))}
                        required
                      />
                      <span className="text-[11px] text-muted-foreground block">
                        {String(t('contract.minVolumeLabel')).replace('{minVolume}', selectedProduct.minVolume)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">
                        {String(t('contract.priceLabel')).replace('{unit}', selectedProduct.unit)}
                      </label>
                      <input
                        type="text"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        className="w-full h-10 border border-border rounded-xl px-3 text-xs sm:text-sm bg-background text-foreground outline-none focus:border-agro"
                        placeholder={String(t('contract.pricePlaceholder'))}
                        required
                      />
                      <span className="text-[11px] text-muted-foreground block">
                        {String(t('contract.marketReference')).replace('{price}', selectedProduct.price).replace('{unit}', selectedProduct.unit)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">{String(t('contract.regionLabel'))}</label>
                      <input
                        type="text"
                        value={customRegion}
                        onChange={(e) => setCustomRegion(e.target.value)}
                        className="w-full h-10 border border-border rounded-xl px-3 text-xs sm:text-sm bg-background text-foreground outline-none focus:border-agro"
                        placeholder={String(t('contract.regionPlaceholder'))}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">{String(t('contract.picContactLabel'))}</label>
                      <input
                        type="text"
                        value={picContact}
                        onChange={(e) => setPicContact(e.target.value)}
                        className="w-full h-10 border border-border rounded-xl px-3 text-xs sm:text-sm bg-background text-foreground outline-none focus:border-agro"
                        placeholder={String(t('contract.picContactPlaceholder'))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">{String(t('contract.supplyDurationLabel'))}</label>
                    <select
                      value={supplyDuration}
                      onChange={(e) => setSupplyDuration(e.target.value)}
                      className="w-full h-10 border border-border rounded-xl px-3 text-xs sm:text-sm bg-background text-foreground outline-none focus:border-agro cursor-pointer"
                    >
                      <option value="1 Kali Pengiriman (Spot Contract)">{String(t('contract.durationOneTime'))}</option>
                      <option value="3 Bulan (Pasokan Rutin Mingguan)">{String(t('contract.duration3Months'))}</option>
                      <option value="6 Bulan (Kontrak Semester Berjangka)">{String(t('contract.duration6Months'))}</option>
                      <option value="12 Bulan (Kontrak Tahunan Prioritas)">{String(t('contract.duration12Months'))}</option>
                    </select>
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-full font-bold px-6 h-10 border-border cursor-pointer"
                    >
                      Batal
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        if (!companyName || !volume || !customPrice || !customRegion) {
                          toast.error('Lengkapi rincian formulir terlebih dahulu.')
                          return
                        }
                        setModalStep(2)
                      }}
                      className="rounded-full font-bold px-6 h-10 bg-agro hover:bg-agro/90 text-white cursor-pointer"
                    >
                      {String(t('contract.nextButton'))} <ArrowRight size={15} className="ml-1.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: LEGAL CONTRACT PREVIEW & WET SIGN PDF UPLOAD */}
              {modalStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Visual Paper Draft Document */}
                  <div className="rounded-2xl border border-border bg-white text-black p-5 shadow-xs space-y-3 text-xs max-h-64 overflow-y-auto">
                    <div className="text-center border-b border-gray-200 pb-3">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Image src="/gromar-logo.png" alt="Gromar" width={24} height={24} />
                        <span className="font-extrabold text-sm tracking-tight text-green-900">GROMAR B2B EXCHANGE</span>
                      </div>
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-800">
                        SURAT PERJANJIAN PENGADAAN PASOKAN KOMODITAS
                      </h4>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                        NO: 088/SPK-GRM/{sector.toUpperCase()}/IX/2026
                      </p>
                    </div>

                    <div className="space-y-2 text-[11px] text-gray-700 leading-relaxed">
                      <p>
                        Pada hari ini telah disepakati draf kontrak kerja sama pengadaan komoditas antara:
                      </p>
                      <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-[10px]">
                        <div>
                          <strong>PIHAK PERTAMA (PEMBELI):</strong>
                          <p>{companyName || user?.name}</p>
                          <p>NIB/NIK: {nibOrNik || '-'}</p>
                          <p>Wilayah: {customRegion}</p>
                        </div>
                        <div>
                          <strong>PIHAK KEDUA (PENYEDIA):</strong>
                          <p>Gromar Producers Hub & Partners</p>
                          <p>Komoditas: {selectedProduct.name}</p>
                          <p>Asal: {selectedProduct.region}</p>
                        </div>
                      </div>

                      <p>
                        <strong>Pasal 1 (Objek & Volume):</strong> Pihak Kedua menyediakan {selectedProduct.name} sejumlah <strong>{volume}</strong> dengan mutu standar teruji.
                      </p>
                      <p>
                        <strong>Pasal 2 (Harga & Pembayaran):</strong> Nilai pasokan disepakati <strong>{customPrice} / {selectedProduct.unit}</strong> dengan sistem penguncian harga berjangka.
                      </p>
                      <p>
                        <strong>Pasal 3 (Durasi):</strong> Perjanjian berlaku selama <strong>{supplyDuration}</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Upload Wet Sign / Scan PDF Area */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground flex items-center justify-between">
                      <span>{String(t('contract.uploadScanLabel'))}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">(Opsional)</span>
                    </label>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-2xl border-2 border-dashed border-border hover:border-agro bg-secondary/30 p-5 text-center cursor-pointer transition-all hover:bg-secondary/50 group"
                    >
                      <UploadCloud size={28} className="mx-auto text-muted-foreground group-hover:text-agro transition-colors mb-2" />
                      <p className="text-xs font-bold text-foreground">
                        {uploadedFileName ? uploadedFileName : String(t('contract.uploadDragDrop'))}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {String(t('contract.uploadScanHint'))}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between gap-3 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setModalStep(1)}
                      className="rounded-full font-bold px-6 h-10 border-border cursor-pointer"
                    >
                      Kembali
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setModalStep(3)}
                      className="rounded-full font-bold px-6 h-10 bg-agro hover:bg-agro/90 text-white cursor-pointer"
                    >
                      Lanjut ke Pengesahan ACC <ArrowRight size={15} className="ml-1.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: BUYER ACC & DIGITAL SIGNATURE */}
              {modalStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 space-y-3">
                    <div className="flex items-center gap-2.5 text-emerald-600 font-bold text-sm">
                      <ShieldCheck size={18} />
                      <span>Pengesahan Pihak Pertama (ACC Pembeli)</span>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                      <p>
                        Dokumen kontrak ini akan diteruskan ke <strong>Pihak Kedua (Produsen/Admin)</strong> untuk ditinjau dan diberikan persetujuan (ACC kedua) secara bergantian.
                      </p>
                      <p>
                        Kedua belah pihak saling terlindungi oleh klausul hukum perdagangan komoditas berjangka Gromar.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-emerald-500/20">
                      <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={buyerAgreed}
                          onChange={(e) => setBuyerAgreed(e.target.checked)}
                          className="mt-0.5 rounded border-border text-agro focus:ring-agro"
                          required
                        />
                        <span className="font-semibold leading-tight">
                          {String(t('contract.buyerDeclaration'))}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Optional Notes */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Catatan Tambahan untuk Pihak Kedua (Opsional)</label>
                    <textarea
                      value={buyerNotes}
                      onChange={(e) => setBuyerNotes(e.target.value)}
                      rows={2}
                      className="w-full border border-border rounded-xl p-3 text-xs bg-background text-foreground outline-none focus:border-agro"
                      placeholder="Contoh: Jadwal pengiriman perdana tanggal 1 bulan depan..."
                    />
                  </div>

                  <div className="pt-4 flex justify-between gap-3 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setModalStep(2)}
                      className="rounded-full font-bold px-6 h-10 border-border cursor-pointer"
                    >
                      Kembali
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !buyerAgreed}
                      className="rounded-full font-bold px-6 h-10 bg-agro hover:bg-agro/90 text-white cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {isSubmitting ? String(t('contract.submitting')) : String(t('contract.submitButton'))}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════════════
          OFFICIAL LEGAL CONTRACT DOCUMENT VIEWER MODAL (PRINT / REVIEW / ACC)
      ═══════════════════════════════════════════════════════════════════════════════════ */}
      {isDocViewerOpen && viewingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto flex flex-col justify-between">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-5 print:hidden">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-agro" />
                <h3 className="font-extrabold text-foreground text-sm sm:text-base">
                  Dokumen Surat Perjanjian B2B Resmi
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrintDocument}
                  className="rounded-xl font-bold text-xs border-border flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>{String(t('contract.printDocButton'))}</span>
                </Button>
                <button
                  onClick={() => setIsDocViewerOpen(false)}
                  className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary text-muted-foreground transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* A4 Paper Document Content */}
            <div className="bg-white text-black p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-inner space-y-6 text-xs leading-relaxed font-serif">
              {/* Header Letterhead */}
              <div className="text-center border-b-2 border-black pb-4">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <Image src="/gromar-logo.png" alt="Gromar" width={36} height={36} />
                  <span className="font-black text-lg tracking-tight text-green-950 font-sans">
                    PT GROMAR INTEGRASI NUSANTARA
                  </span>
                </div>
                <p className="text-[10px] text-gray-600 font-sans">
                  Gromar Agro-Marine Commodity Exchange & B2B Forward Contract Platform
                </p>
                <p className="text-[10px] text-gray-500 font-sans">
                  Kawasan Bisnis Agro-Maritim Indonesia · www.gromar.id · legal@gromar.id
                </p>
              </div>

              <div className="text-center space-y-1">
                <h4 className="font-bold text-sm uppercase underline tracking-wider font-sans">
                  SURAT PERJANJIAN KERJA SAMA PENGADAAN KOMODITAS
                </h4>
                <p className="text-xs font-mono font-bold text-gray-700">
                  Nomor: 088/SPK-GRM/{viewingContract.sector.toUpperCase()}/{viewingContract.id.slice(0, 8).toUpperCase()}/2026
                </p>
              </div>

              <p className="text-justify">
                Pada hari ini, tanggal <strong>{new Date(viewingContract.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>, bertempat di sistem elektronik Gromar B2B Exchange, telah disepakati perjanjian kerja sama pengadaan pasokan antara pihak-pihak:
              </p>

              {/* Identity of Parties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 font-sans text-xs">
                <div className="space-y-1">
                  <strong className="text-green-900 block border-b border-gray-300 pb-1">PIHAK PERTAMA (PEMBELI):</strong>
                  <p><strong>Nama Usaha:</strong> {viewingContract.companyName || viewingContract.user?.name || 'Perusahaan Pembeli'}</p>
                  <p><strong>NIB / NIK:</strong> {viewingContract.nibOrNik || 'Terverifikasi Akun Gromar'}</p>
                  <p><strong>Email / PIC:</strong> {viewingContract.user?.email || '-'}</p>
                  <p><strong>Titik Gudang:</strong> {viewingContract.region}</p>
                </div>

                <div className="space-y-1">
                  <strong className="text-blue-900 block border-b border-gray-300 pb-1">PIHAK KEDUA (PENYEDIA):</strong>
                  <p><strong>Penyedia:</strong> Gromar Commodity Producer Hub</p>
                  <p><strong>Sektor:</strong> {viewingContract.sector === 'agro' ? 'Agrikultur & Pertanian' : 'Kelautan & Perikanan'}</p>
                  <p><strong>Daerah Asal:</strong> {viewingContract.region}</p>
                  <p><strong>Legalitas:</strong> Mitra Terverifikasi Platform</p>
                </div>
              </div>

              {/* Agreement Articles */}
              <div className="space-y-3">
                <div>
                  <strong className="block font-sans text-gray-900">PASAL 1: OBJEK PERJANJIAN & SPESIFIKASI MUTU</strong>
                  <p className="text-justify text-gray-700">
                    Pihak Kedua berkewajiban menyiapkan dan menyuplai komoditas <strong>{viewingContract.productName}</strong> dengan volume total sejumlah <strong>{viewingContract.minVolume}</strong> dengan spesifikasi mutu standar SNI dan lolos uji kesegaran.
                  </p>
                </div>

                <div>
                  <strong className="block font-sans text-gray-900">PASAL 2: HARGA KONTRAK & SKEMA PEMBAYARAN</strong>
                  <p className="text-justify text-gray-700">
                    Harga komoditas dikunci secara resmi sebesar <strong>{viewingContract.price}</strong> dan tidak dapat dinaikkan sepihak selama masa kontrak berjalan. Pembayaran diamankan menggunakan rekening bersama (escrow) platform Gromar.
                  </p>
                </div>

                <div>
                  <strong className="block font-sans text-gray-900">PASAL 3: PENGIRIMAN & PENYERAHAN BARANG</strong>
                  <p className="text-justify text-gray-700">
                    Penyaluran pasokan dilaksanakan dengan durasi <strong>{viewingContract.supplyDuration || 'Rutin Berkala'}</strong> menuju titik serah terima di wilayah <strong>{viewingContract.region}</strong> didukung armada logistik mitra terpercaya.
                  </p>
                </div>

                <div>
                  <strong className="block font-sans text-gray-900">PASAL 4: HAK, KEWAJIBAN, & PENGESAHAN DUA PIHAK</strong>
                  <p className="text-justify text-gray-700">
                    Kedua belah pihak sepakat mengikatkan diri secara sukarela dan saling menyetujui (ACC) setiap butir perjanjian ini melalui tanda tangan basah yang diunggah dan/atau tanda tangan elektronik terverifikasi.
                  </p>
                </div>
              </div>

              {/* Two Parties Signature Blocks */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-300 font-sans text-xs">
                {/* Party 1 Sign Box */}
                <div className="border border-green-300 rounded-xl p-3 bg-green-50/50 text-center space-y-1">
                  <span className="text-[10px] font-bold text-green-900 block">PIHAK PERTAMA (PEMBELI)</span>
                  <div className="py-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded bg-green-200 text-green-800 border border-green-300">
                      <Check size={13} /> TELAH DI-ACC & DISAHKAN
                    </span>
                  </div>
                  <p className="font-bold text-gray-900">{viewingContract.companyName || viewingContract.user?.name}</p>
                  <p className="text-[10px] text-gray-500">Tercatat: {new Date(viewingContract.createdAt).toLocaleDateString('id-ID')}</p>
                </div>

                {/* Party 2 Sign Box */}
                <div className={`border rounded-xl p-3 text-center space-y-1 ${
                  viewingContract.status === 'APPROVED'
                    ? 'border-green-300 bg-green-50/50'
                    : viewingContract.status === 'REJECTED'
                    ? 'border-red-300 bg-red-50/50'
                    : 'border-amber-300 bg-amber-50/50'
                }`}>
                  <span className="text-[10px] font-bold text-gray-800 block">PIHAK KEDUA (PENYEDIA / ADMIN)</span>
                  <div className="py-2">
                    {viewingContract.status === 'APPROVED' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded bg-green-200 text-green-800 border border-green-300">
                        <Check size={13} /> TELAH DI-ACC OLEH PENYEDIA
                      </span>
                    ) : viewingContract.status === 'REJECTED' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded bg-red-200 text-red-800 border border-red-300">
                        <X size={13} /> PENGAJUAN DITOLAK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded bg-amber-200 text-amber-800 border border-amber-300">
                        <Clock size={13} /> MENUNGGU PENINJAUAN (ACC)
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-gray-900">Gromar Authorized Hub</p>
                  <p className="text-[10px] text-gray-500">Legal B2B Registry</p>
                </div>
              </div>

              {/* Uploaded Scan file notice */}
              {viewingContract.documentUrl && (
                <div className="mt-4 p-3 bg-gray-100 rounded-xl border border-gray-200 text-[11px] font-sans flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck size={16} className="text-green-700" />
                    <span>Lampiran Berkas Scan / Tanda Tangan Basah Terlampir</span>
                  </div>
                  <a
                    href={viewingContract.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-agro font-bold hover:underline flex items-center gap-1"
                  >
                    Buka Berkas <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            {/* Bottom Action / Review Bar */}
            <div className="mt-5 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDocViewerOpen(false)}
                className="w-full sm:w-auto rounded-full font-bold px-6 h-10 border-border cursor-pointer"
              >
                {String(t('contract.closeDocButton'))}
              </Button>

              {/* Review & ACC Action Buttons for Party 2 (Seller/Admin) */}
              {isAdminOrSeller && viewingContract.status === 'PENDING' && (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleUpdateStatus(viewingContract.id, 'REJECTED')}
                    className="rounded-full font-bold px-5 h-10 cursor-pointer"
                  >
                    <X size={15} className="mr-1.5" /> Tolak Kontrak
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleUpdateStatus(viewingContract.id, 'APPROVED')}
                    className="rounded-full font-bold px-6 h-10 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md"
                  >
                    <Check size={16} className="mr-1.5" /> ACC & Sahkan Kontrak (Pihak II)
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-center">
            <div className={`mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4 ${
              confirmType === 'danger' ? 'bg-red-100 text-red-600' :
              confirmType === 'success' ? 'bg-emerald-100 text-emerald-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {confirmType === 'danger' ? <Trash2 size={24} /> :
               confirmType === 'success' ? <Check size={24} /> :
               <FileSignature size={24} />}
            </div>

            <h3 className="text-lg font-extrabold text-foreground">{confirmTitle}</h3>
            <p className="text-muted-foreground text-xs sm:text-sm mt-2 px-2 leading-relaxed">
              {confirmMessage}
            </p>

            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmOpen(false)}
                className="w-1/2 rounded-full font-bold h-10 border-border cursor-pointer"
              >
                {String(t('contract.backButton'))}
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
                  confirmType === 'danger' ? 'bg-rose-600 hover:bg-rose-700' :
                  confirmType === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  'bg-primary hover:bg-primary/90'
                }`}
              >
                {String(t('contract.confirmProceed'))}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
