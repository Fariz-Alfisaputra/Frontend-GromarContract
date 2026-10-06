'use client'

import { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Search,
  Sprout,
  Waves,
  MapPin,
  ShieldCheck,
  ArrowUpDown,
  FileText,
  Clock,
  Layers,
  Users,
  AlertTriangle,
  Sparkles,
  Check,
  X,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store/auth'
import { useTranslation } from '@/lib/i18n/use-translation'
import { contractApi } from '@/lib/api'
import { toast } from 'sonner'
import { CommodityTicker } from '@/components/dashboard/commodity-ticker'
import { B2BCalculator } from '@/components/dashboard/b2b-calculator'

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
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  escrowStatus?: string
  cancellationReason?: string
  cancelledBy?: string
  cancelledAt?: string
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
    { name: 'Beras Premium (Aceh Besar)', category: 'Grains', region: 'Indrapuri, Aceh Besar', price: 'Rp 13,500', unit: 'kg', minVolume: '3 tons', image: '/agri-rice.webp', status: 'Open' },
    { name: 'Beras Organik (Karawang)', category: 'Grains', region: 'Karawang, Jawa Barat', price: 'Rp 11,500', unit: 'kg', minVolume: '5 tons', image: '/agri-rice.webp', status: 'Filling fast' },
    { name: 'Kopi Arabika Gayo (Takengon)', category: 'Coffee', region: 'Takengon, Aceh Tengah', price: 'Rp 98,000', unit: 'kg', minVolume: '300 kg', image: '/agri-coffee.webp', status: 'Filling fast' },
  ],
  marine: [
    { name: 'Ikan Tongkol (Peunayong)', category: 'Fish', region: 'Peunayong, Banda Aceh', price: 'Rp 28,000', unit: 'kg', minVolume: '500 kg', image: '/marine-fish.webp', status: 'Open' },
    { name: 'Ikan Tongkol (Kajhu)', category: 'Fish', region: 'Kajhu, Aceh Besar', price: 'Rp 26,500', unit: 'kg', minVolume: '800 kg', image: '/marine-fish.webp', status: 'Filling fast' },
  ]
}

export function MarketplaceDashboard({ initialSector = 'agro' }: { initialSector?: Sector }) {
  const [sector, setSector] = useState<Sector>(initialSector)
  const [query, setQuery] = useState('')
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const router = useRouter()
  const [myContracts, setMyContracts] = useState<ContractItem[]>([])

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

  return (
    <section className="pt-24 min-h-screen bg-background">
      <CommodityTicker />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-extrabold text-foreground mb-8">
            Daftar Kontrak B2B Anda ({myContracts.length})
        </h1>
        <div className="grid gap-5 md:grid-cols-2">
            {myContracts.map((c) => (
              <div key={c.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-extrabold">{c.productName}</h3>
                <p className="text-sm">Status: {c.status}</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => router.push(`/contract/${c.id}`)}>
                    Lihat Dokumen
                </Button>
              </div>
            ))}
        </div>
      </div>
    </section>
  )
}
