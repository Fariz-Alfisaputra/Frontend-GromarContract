'use client'

import {
  ShieldCheck,
  FileSignature,
  Lock,
  Zap,
  Globe,
  Truck,
  Coins,
  BarChart3,
  CheckCircle2,
  Headphones,
  Leaf,
  Link2,
} from 'lucide-react'

const FEATURES = [
  { icon: ShieldCheck, label: 'Smart Contract Terverifikasi', color: 'text-agro' },
  { icon: FileSignature, label: 'Kontrak Digital Resmi', color: 'text-marine' },
  { icon: Lock, label: 'Escrow Payment Aman', color: 'text-agro' },
  { icon: Zap, label: 'Proses Instan & Cepat', color: 'text-marine' },
  { icon: Globe, label: 'Jangkauan Nasional', color: 'text-agro' },
  { icon: Truck, label: 'Logistik Terintegrasi', color: 'text-marine' },
  { icon: Coins, label: 'Harga Transparan', color: 'text-agro' },
  { icon: BarChart3, label: 'Analytics Real-time', color: 'text-marine' },
  { icon: CheckCircle2, label: 'Verifikasi Kualitas Produk', color: 'text-agro' },
  { icon: Headphones, label: 'Customer Support 24/7', color: 'text-marine' },
  { icon: Leaf, label: 'Ekonomi Sirkular', color: 'text-agro' },
  { icon: Link2, label: 'Jejak Audit Penuh', color: 'text-marine' },
]

export function FeatureMarquee() {
  const list = [...FEATURES, ...FEATURES]

  return (
    <div className="relative w-full overflow-hidden border-y border-border/60 bg-marine-soft py-3">
      <div className="mx-auto flex items-center">
        <div className="flex w-full overflow-hidden">
          <div className="flex animate-[marquee_40s_linear_infinite] whitespace-nowrap hover:[animation-play-state:paused]">
            {list.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={`${item.label}-${index}`}
                  className="mx-5 flex items-center gap-2.5 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm px-4 py-2 text-xs transition-all duration-300 hover:bg-card/80 hover:shadow-md hover:scale-105"
                >
                  <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                  <span className="font-semibold text-foreground whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
