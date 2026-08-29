'use client'

import { Check, X, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

const COMPARISONS = [
  {
    feature: 'Kepastian Harga',
    traditional: 'Harga berfluktuasi tajam tergantung spekulasi pasar harian & cuaca',
    gromar: 'Harga dikunci stabil sejak awal penandatanganan kontrak',
    gromarWin: true,
  },
  {
    feature: 'Jaminan Pasokan',
    traditional: 'Risiko barang langka atau habis dibeli kompetitor tanpa garansi',
    gromar: 'Volume panen/tangkapan teralokasi khusus sesuai kuota kontrak',
    gromarWin: true,
  },
  {
    feature: 'Keamanan Transaksi & DP',
    traditional: 'Pembayaran DP berisiko hangus jika vendor gagal kirim',
    gromar: 'Dana dikunci di Escrow aman, cair hanya jika barang terverifikasi',
    gromarWin: true,
  },
  {
    feature: 'Kualitas & Traseabilitas',
    traditional: 'Tanpa standar mutu baku & riwayat asal usul produk tidak jelas',
    gromar: 'Verifikasi mutu Grade A/Export & monitoring Cold Chain realtime',
    gromarWin: true,
  },
  {
    feature: 'Efisiensi Biaya Distribusi',
    traditional: 'Melewati 3-5 perantara (tengkulak, agen grosir, makelar)',
    gromar: 'Langsung dari Petani & Nelayan terverifikasi ke Pembeli Industri',
    gromarWin: true,
  },
]

export function BusinessComparison() {
  return (
    <section className="py-14 border-t border-border bg-card/40 rounded-3xl p-6 sm:p-10 my-10">
      <ScrollReveal direction="up" distance={30}>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Kenapa Bisnis Memilih GROMAR?
          </span>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Perbandingan Transaksi Tradisional vs GROMAR Smart Contract
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Bandingkan bagaimana rantai pasok digital Gromar Contract memberikan efisiensi &amp; proteksi mutlak bagi bisnis Anda.
          </p>
        </div>
      </ScrollReveal>

      {/* Comparison Table */}
      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="py-4 px-4 text-xs font-bold uppercase text-muted-foreground w-1/4">
                Aspek Bisnis
              </th>
              <th className="py-4 px-4 text-xs font-bold uppercase text-muted-foreground w-3/8 bg-secondary/30 rounded-t-2xl">
                Pengadaan Tradisional
              </th>
              <th className="py-4 px-4 text-xs font-bold uppercase text-primary w-3/8 bg-primary/10 rounded-t-2xl">
                <span className="flex items-center gap-1.5 font-extrabold">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  GROMAR Smart Contract
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {COMPARISONS.map((row) => (
              <tr key={row.feature} className="transition-colors hover:bg-secondary/40">
                <td className="py-4 px-4 text-sm font-bold text-foreground">
                  {row.feature}
                </td>
                <td className="py-4 px-4 text-xs text-muted-foreground bg-secondary/10">
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 mt-0.5">
                      <X className="h-3 w-3" />
                    </span>
                    <span>{row.traditional}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-xs font-medium text-foreground bg-primary/5">
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mt-0.5">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="font-semibold">{row.gromar}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
