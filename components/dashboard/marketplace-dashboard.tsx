'use client'

import { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store/auth'
import { contractApi } from '@/lib/api'
import { toast } from 'sonner'

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

const STATS: Record<Sector, { label: string; value: string }[]> = {
  agro: [
    { label: 'Active listings', value: '1,240' },
    { label: 'Farmers online', value: '8.6k' },
    { label: 'Avg. price lock', value: '90 days' },
  ],
  marine: [
    { label: 'Active listings', value: '870' },
    { label: 'Fishermen online', value: '3.9k' },
    { label: 'Avg. price lock', value: '60 days' },
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

  const accent = sector === 'agro' ? 'agro' : 'marine'

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

  // Admin/Seller: Update Status (APPROVED / REJECTED)
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

  return (
    <section
      className={`pt-18 transition-colors ${
        sector === 'agro'
          ? 'bg-gradient-to-b from-agro-soft/40 to-background'
          : 'bg-gradient-to-b from-marine-soft/40 to-background'
      }`}
    >
      {/* Dashboard header band */}
      <div className="relative overflow-hidden border-b border-border h-[400px] flex items-center">
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
        {/* Gradient overlay: dark/solid green on the left, fades completely to transparent on the right */}
        {/* This makes bapak's face clearly visible while keeping the text highly readable */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            sector === 'agro'
              ? 'bg-gradient-to-r from-[#1a5c2a]/85 via-[#1a5c2a]/55 to-transparent'
              : 'bg-gradient-to-r from-[#0c4a6e]/85 via-[#0c4a6e]/55 to-transparent'
          }`}
        />
        {/* Subtle dark filter over the whole background to enhance white text readability */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        
        {/* Floating decorative blobs */}
        <div className="pointer-events-none absolute -right-16 top-8 h-56 w-56 rounded-full bg-white/10 blur-2xl animate-float-slow" />
        <div className="pointer-events-none absolute right-1/3 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl animate-float" />

        <div className="relative mx-auto max-w-7xl w-full px-5 sm:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
            <ShieldCheck className="h-4 w-4" />
            {isAdminOrSeller ? 'Smart Contract Management Dashboard' : 'One marketplace · Choose your sector to start'}
          </span>
          <h1 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-4xl lg:text-5xl">
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
          <p className="mt-3 max-w-xl text-pretty text-lg leading-relaxed text-white drop-shadow-sm font-medium">
            {isAdminOrSeller
              ? 'Tinjau, setujui, dan awasi pengajuan kontrak suplai pertanian & kelautan berjangka secara realtime.'
              : 'Browse verified producers, lock in fair prices, and sign transparent contracts — all in one place. Switch between land and sea anytime.'}
          </p>

          {/* Sector toggle */}
          <div className="mt-8 inline-flex rounded-full border border-white/30 bg-white/20 p-1 shadow-sm backdrop-blur">
            <button
              type="button"
              onClick={() => setSector('agro')}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                sector === 'agro'
                  ? 'bg-white text-agro shadow-sm'
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
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                sector === 'marine'
                  ? 'bg-white text-marine shadow-sm'
                  : 'text-white/90 hover:text-white'
              }`}
              aria-pressed={sector === 'marine'}
            >
              <Waves className="h-4 w-4" />
              Marine
            </button>
          </div>
        </div>
      </div>

      {/* Search + results */}
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
        {!isAdminOrSeller && (
          <>
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
                  className={`h-12 w-full rounded-full border border-border bg-card pl-12 pr-4 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-${accent}`}
                />
              </div>
              <Button
                variant="outline"
                className="h-12 w-fit rounded-full border-border px-5 font-semibold text-foreground"
              >
                <ArrowUpDown className="mr-1 h-4 w-4" />
                Sort by price
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              {results.length} contract{results.length === 1 ? '' : 's'} available in{' '}
              <span className="font-semibold text-foreground">
                {sector === 'agro' ? 'Agriculture' : 'Marine'}
              </span>
            </p>

            {/* Catalog Grid */}
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {results.map((p) => (
                <article
                  key={p.name}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
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
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <span
                      className={`text-xs font-semibold ${
                        sector === 'agro' ? 'text-agro' : 'text-marine'
                      }`}
                    >
                      {p.category}
                    </span>
                    <h3 className="mt-1 text-base font-bold text-foreground">
                      {p.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {p.region}
                    </p>

                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-lg font-extrabold text-foreground">
                          {p.price}
                        </p>
                        <p className="text-xs text-muted-foreground">per {p.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Min. contract</p>
                        <p className="text-sm font-semibold text-foreground">
                          {p.minVolume}
                        </p>
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
                      <FileSignature className="mr-1 h-4 w-4" />
                      Request Contract
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            {results.length === 0 && (
              <div className="mt-10 rounded-3xl border border-dashed border-border bg-secondary/50 py-16 text-center">
                <p className="text-lg font-semibold text-foreground">
                  No contracts match &ldquo;{query}&rdquo;
                </p>
                <p className="mt-1 text-muted-foreground">
                  Try a different keyword or switch sector.
                </p>
              </div>
            )}
          </>
        )}

        {/* ── B2B Contract Requests List (CRUD Section) ── */}
        {user && (
          <div className={isAdminOrSeller ? 'mt-4' : 'mt-16 pt-12 border-t border-border'}>
            <h2 className="text-2xl font-extrabold text-foreground flex items-center gap-2 mb-2">
              <FileText className={sector === 'agro' ? 'text-agro' : 'text-marine'} />
              {user.role === 'ADMIN' ? 'Monitoring Kontrak B2B Platform' :
               user.role === 'SELLER' ? 'Persetujuan Kontrak B2B Masuk' :
               'Daftar Kontrak B2B Saya'}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              {user.role === 'ADMIN' ? 'Pantau seluruh riwayat transaksi dan status kontrak pintar yang berjalan di platform Gromar.' :
               user.role === 'SELLER' ? 'Tinjau penawaran harga & volume dari pembeli. Setujui untuk mengunci kontrak.' :
               'Kelola pengajuan kontrak suplai pertanian dan hasil laut berjangka Anda.'}
            </p>

            {myContracts.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
                {user.role === 'CUSTOMER' 
                  ? 'Anda belum mengajukan kontrak B2B apapun. Klik "Request Contract" di salah satu katalog di atas untuk memulai.'
                  : 'Belum ada pengajuan kontrak B2B masuk di platform.'}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {myContracts.map((c) => (
                  <div key={c.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold rounded-full px-2 py-0.5 ${
                          c.sector === 'agro' ? 'bg-agro-soft text-agro' : 'bg-marine-soft text-marine'
                        }`}>
                          {c.sector === 'agro' ? 'Agriculture' : 'Marine'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          c.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold text-foreground">{c.productName}</h3>
                      
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Volume Kontrak</span>
                          <p className="font-semibold text-foreground">{c.minVolume}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Harga Terkunci</span>
                          <p className="font-semibold text-foreground">{c.price}</p>
                        </div>
                        <div className="col-span-2 mt-1">
                          <span className="text-muted-foreground">Wilayah Asal</span>
                          <p className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                            <MapPin size={12} className="text-muted-foreground" />
                            {c.region}
                          </p>
                        </div>
                        {user.role === 'ADMIN' && c.user && (
                          <div className="col-span-2 mt-2 pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
                            Pengaju: <span className="font-bold">{c.user.name}</span> ({c.user.email})
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2 border-t border-border/50 pt-4 justify-end">
                      {/* Seller/Admin Actions */}
                      {(user.role === 'ADMIN' || user.role === 'SELLER') && c.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(c.id, 'APPROVED')}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-full font-bold px-3 text-xs"
                          >
                            <Check size={14} className="mr-1" /> Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateStatus(c.id, 'REJECTED')}
                            className="rounded-full font-bold px-3 text-xs"
                          >
                            <X size={14} className="mr-1" /> Tolak
                          </Button>
                        </>
                      )}
                      
                      {/* Delete Action (creator or admin) */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteContract(c.id)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full font-bold px-3 text-xs flex items-center gap-1"
                      >
                        <Trash2 size={14} />
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

      {/* ── B2B Contract Request Modal (Form Dialog) ── */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary text-muted-foreground transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 text-primary font-bold">
              <FileSignature size={20} className={sector === 'agro' ? 'text-agro' : 'text-marine'} />
              <span>Pengajuan Kontrak B2B</span>
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
                  className="w-full h-10 border border-border rounded-xl px-3 text-sm bg-background text-foreground outline-none focus:border-primary"
                  placeholder="Contoh: 10 tons, 500 kg"
                  required
                />
                <span className="text-[10px] text-muted-foreground block">
                  Minimal Pengajuan: {selectedProduct.minVolume}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Harga Penawaran per {selectedProduct.unit}</label>
                <input
                  type="text"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full h-10 border border-border rounded-xl px-3 text-sm bg-background text-foreground outline-none focus:border-primary"
                  placeholder="Contoh: Rp 12,000"
                  required
                />
                <span className="text-[10px] text-muted-foreground block">
                  Acuan Pasar: {selectedProduct.price} / {selectedProduct.unit}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Wilayah Distribusi</label>
                <input
                  type="text"
                  value={customRegion}
                  onChange={(e) => setCustomRegion(e.target.value)}
                  className="w-full h-10 border border-border rounded-xl px-3 text-sm bg-background text-foreground outline-none focus:border-primary"
                  placeholder="Asal daerah produsen"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 rounded-full font-bold h-11 border-border"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-1/2 rounded-full font-bold h-11 text-white ${
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

      {/* ── Beautiful Confirmation Modal ── */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-center">
            {/* Action Icon */}
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
            <p className="text-muted-foreground text-xs mt-2 px-2 leading-relaxed">
              {confirmMessage}
            </p>

            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmOpen(false)}
                className="w-1/2 rounded-full font-bold h-10 border-border"
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
                className={`w-1/2 rounded-full font-bold h-10 text-white ${
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
