'use client'

import { useState, useMemo } from 'react'
import { Calculator, ShieldCheck, TrendingDown, ArrowRight, Zap, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/use-translation'

type CommodityOption = {
  id: string
  name: string
  unit: string
  basePrice: number
  category: 'agro' | 'marine'
  defaultVol: number
}

const COMMODITIES: CommodityOption[] = [
  {
    id: 'rice',
    name: 'Beras Premium Karawang',
    unit: 'kg',
    basePrice: 11500,
    category: 'agro',
    defaultVol: 2000,
  },
  {
    id: 'tuna',
    name: 'Ikan Tuna Fresh Grade A',
    unit: 'kg',
    basePrice: 58000,
    category: 'marine',
    defaultVol: 500,
  },
  {
    id: 'coffee',
    name: 'Kopi Arabika Kintamani',
    unit: 'kg',
    basePrice: 92000,
    category: 'agro',
    defaultVol: 300,
  },
  {
    id: 'shrimp',
    name: 'Udang Vaname Cirebon',
    unit: 'kg',
    basePrice: 96000,
    category: 'marine',
    defaultVol: 400,
  },
]

export function B2BCalculator({
  onSelectCommodity,
}: {
  onSelectCommodity?: (name: string, volume: string, price: string) => void
}) {
  const { t } = useTranslation()
  const [selectedId, setSelectedId] = useState<string>('rice')
  const [volume, setVolume] = useState<number>(2000)
  const [durationMonths, setDurationMonths] = useState<number>(3)

  const commodityName = (id: string) =>
    String(t(`b2bCalculator.commodities.${id}`))

  const selectedCommodity = useMemo(
    () => COMMODITIES.find((c) => c.id === selectedId) || COMMODITIES[0],
    [selectedId]
  )

  // Calculations
  const results = useMemo(() => {
    const totalUnits = volume * durationMonths
    // Estimated spot retail price (including traditional middleman 18% markup + inflation risk)
    const retailUnitRate = selectedCommodity.basePrice * 1.22
    const totalRetailCost = totalUnits * retailUnitRate

    // Gromar Bulk Contract Discount Rate based on volume & duration
    let discount = 0.10 // 10% base contract discount
    if (volume >= 5000) discount += 0.05
    if (durationMonths >= 6) discount += 0.03

    const gromarUnitRate = Math.round(selectedCommodity.basePrice * (1 - discount))
    const totalGromarCost = totalUnits * gromarUnitRate
    const totalSavings = Math.max(0, totalRetailCost - totalGromarCost)
    const savingsPercent = Math.round((totalSavings / totalRetailCost) * 100)

    return {
      retailUnitRate: Math.round(retailUnitRate),
      totalRetailCost: Math.round(totalRetailCost),
      gromarUnitRate,
      totalGromarCost: Math.round(totalGromarCost),
      totalSavings: Math.round(totalSavings),
      savingsPercent,
    }
  }, [selectedCommodity, volume, durationMonths])

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val)

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between gap-3 border-b border-border/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-agro/10 text-agro">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300">
              <Zap className="h-3 w-3" /> {String(t('b2bCalculator.badge'))}
            </span>
            <h3 className="text-xl font-extrabold text-foreground leading-snug">
              {String(t('b2bCalculator.title'))}
            </h3>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-12">
        {/* Controls Column */}
        <div className="space-y-5 lg:col-span-7">
          {/* Commodity Selection */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
              {String(t('b2bCalculator.commodityStep'))}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {COMMODITIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(c.id)
                    setVolume(c.defaultVol)
                  }}
                  className={`flex flex-col rounded-2xl border p-3.5 text-left transition-all ${
                    selectedId === c.id
                      ? c.category === 'agro'
                        ? 'border-agro bg-agro-soft/60 shadow-xs'
                        : 'border-marine bg-marine-soft/60 shadow-xs'
                      : 'border-border bg-card hover:bg-secondary/70'
                  }`}
                >
                  <span className="text-xs font-bold text-foreground">{commodityName(c.id)}</span>
                  <span className="mt-1 text-[11px] font-extrabold text-muted-foreground">
                    {String(t('b2bCalculator.baseLabel'))
                      .replace('{price}', c.basePrice.toLocaleString('id-ID'))
                      .replace('{unit}', c.unit)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Volume Slider & Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                {String(t('b2bCalculator.volumeStep'))}
              </label>
              <span className="text-sm font-extrabold text-primary">
                {volume.toLocaleString('id-ID')} {selectedCommodity.unit} {String(t('b2bCalculator.perMonth'))}
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={20000}
              step={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
              <span>100 {selectedCommodity.unit}</span>
              <span>5.000 {selectedCommodity.unit}</span>
              <span>20.000 {selectedCommodity.unit}</span>
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
              {String(t('b2bCalculator.durationStep'))}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 6, 12].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMonths(m)}
                  className={`rounded-xl border py-2.5 text-xs font-bold transition-colors ${
                    durationMonths === m
                      ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                      : 'border-border bg-card text-foreground hover:bg-secondary'
                  }`}
                >
                  {m} {String(t('b2bCalculator.monthUnit')).replace('{m}', '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Card Column */}
        <div className="flex flex-col justify-between rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-background to-teal-500/10 p-6 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">{String(t('b2bCalculator.projectionSavings'))}</p>
                <p className="mt-1 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(results.totalSavings)}
                </p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white font-extrabold text-sm shadow-md">
                -{results.savingsPercent}%
              </span>
            </div>

            <div className="mt-5 space-y-3.5 text-xs">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>{String(t('b2bCalculator.retailEstimate'))}</span>
                <span className="font-semibold line-through text-rose-500">
                  {formatRupiah(results.totalRetailCost)}
                </span>
              </div>
              <div className="flex justify-between items-center text-foreground font-bold">
                <span>{String(t('b2bCalculator.totalGromar'))}</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatRupiah(results.totalGromarCost)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border text-[11px] text-muted-foreground">
                <span>{String(t('b2bCalculator.lockedRate'))}</span>
                <span className="font-extrabold text-foreground">
                  Rp {results.gromarUnitRate.toLocaleString('id-ID')} / {selectedCommodity.unit}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-card/80 p-3.5 border border-border text-[11px] space-y-1.5 text-muted-foreground">
              <p className="flex items-center gap-1.5 font-bold text-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                {String(t('b2bCalculator.guaranteeTitle'))}
              </p>
              <p>
                {String(t('b2bCalculator.guaranteeBody'))}
              </p>
            </div>
          </div>

          <Button
            onClick={() =>
              onSelectCommodity &&
              onSelectCommodity(
                commodityName(selectedCommodity.id),
                `${volume} ${selectedCommodity.unit}`,
                `Rp ${results.gromarUnitRate.toLocaleString('id-ID')}`
              )
            }
            className="mt-6 w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11"
          >
            {String(t('b2bCalculator.applyNow'))}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
