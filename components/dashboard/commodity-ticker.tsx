'use client'

import { TrendingUp, TrendingDown, ShieldCheck, Activity } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/use-translation'

type Commodity = {
  name: string
  price: string
  unit: string
  change: string
  isUp: boolean
  region: string
  sector: 'agro' | 'marine'
}

const COMMODITIES: Commodity[] = [
  {
    name: 'Beras Premium',
    price: 'Rp 11.500',
    unit: 'kg',
    change: '+2.1%',
    isUp: true,
    region: 'Karawang',
    sector: 'agro',
  },
  {
    name: 'Tuna Fresh Grade A',
    price: 'Rp 58.000',
    unit: 'kg',
    change: '+1.4%',
    isUp: true,
    region: 'Makassar',
    sector: 'marine',
  },
  {
    name: 'Kopi Arabika',
    price: 'Rp 92.000',
    unit: 'kg',
    change: '+3.5%',
    isUp: true,
    region: 'Kintamani',
    sector: 'agro',
  },
  {
    name: 'Udang Vaname',
    price: 'Rp 96.000',
    unit: 'kg',
    change: '-0.8%',
    isUp: false,
    region: 'Cirebon',
    sector: 'marine',
  },
  {
    name: 'Bawang Merah Super',
    price: 'Rp 28.500',
    unit: 'kg',
    change: '+1.8%',
    isUp: true,
    region: 'Brebes',
    sector: 'agro',
  },
  {
    name: 'Kepiting Bakau Live',
    price: 'Rp 130.000',
    unit: 'kg',
    change: '+2.9%',
    isUp: true,
    region: 'Balikpapan',
    sector: 'marine',
  },
  {
    name: 'Sayur Organik Dieng',
    price: 'Rp 8.900',
    unit: 'kg',
    change: '-1.2%',
    isUp: false,
    region: 'Dieng',
    sector: 'agro',
  },
  {
    name: 'Rumput Laut Kering',
    price: 'Rp 15.000',
    unit: 'kg',
    change: '+0.5%',
    isUp: true,
    region: 'Nusa Lembongan',
    sector: 'marine',
  },
]

export function CommodityTicker() {
  const { t } = useTranslation()
  // Duplicate for seamless infinite loop
  const list = [...COMMODITIES, ...COMMODITIES]

  return (
    <div className="relative w-full overflow-hidden border-y border-border/80 bg-card/90 backdrop-blur py-2.5 shadow-xs">
      <div className="mx-auto max-w-7xl flex items-center">
        {/* Left Badge Indicator */}
        <div className="z-10 flex shrink-0 items-center gap-2 bg-card pr-4 font-bold text-xs uppercase tracking-wider text-foreground border-r border-border/70 py-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Activity className="h-3.5 w-3.5 text-primary" />
          <span className="hidden sm:inline">{String(t('ticker.marketPulse'))}</span>
        </div>

        {/* Ticker Content Marquee */}
        <div className="flex w-full overflow-hidden">
          <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap hover:[animation-play-state:paused]">
            {list.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="mx-4 flex items-center gap-2 text-xs"
              >
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    item.sector === 'agro' ? 'bg-agro' : 'bg-marine'
                  }`}
                />
                <span className="font-semibold text-foreground">
                  {item.name} ({item.region})
                </span>
                <span className="font-extrabold text-foreground">{item.price}</span>
                <span className="text-[10px] text-muted-foreground">/{item.unit}</span>
                <span
                  className={`flex items-center text-[11px] font-bold ${
                    item.isUp ? 'text-emerald-600' : 'text-rose-500'
                  }`}
                >
                  {item.isUp ? (
                    <TrendingUp className="mr-0.5 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-0.5 h-3 w-3" />
                  )}
                  {item.change}
                </span>
                <span className="mx-3 text-border">|</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
