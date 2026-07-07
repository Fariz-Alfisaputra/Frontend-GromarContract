import { Handshake, Lock, CheckSquare, Coins, Database } from 'lucide-react'

const steps = [
  {
    icon: Handshake,
    title: 'Kontrak Disetujui',
    body: 'Begitu pembeli dan produsen sepakat atas harga, volume, dan tenggat, sistem membuat smart contract yang menuangkan seluruh syarat tersebut dalam bentuk kode program.',
  },
  {
    icon: Lock,
    title: 'Dana Dikunci (Escrow)',
    body: 'Pembeli menyetor dana uang muka (DP), yang otomatis dikunci pada alamat escrow dan tidak dapat diakses sepihak oleh produsen maupun pembeli.',
  },
  {
    icon: CheckSquare,
    title: 'Verifikasi Progres',
    body: 'Setiap tahap realisasi (misalnya konfirmasi timbang hasil panen di titik pengumpulan) diinput ke sistem sebagai pemicu (trigger) kondisi kontrak.',
  },
  {
    icon: Coins,
    title: 'Pencairan Otomatis',
    body: 'Begitu syarat pada kontrak terpenuhi, smart contract melepaskan dana ke rekening produsen secara otomatis tanpa persetujuan manual tambahan.',
  },
  {
    icon: Database,
    title: 'Pencatatan Permanen',
    body: 'Seluruh riwayat transaksi tersimpan secara aman, tidak dapat diubah (immutable), dan dapat diaudit oleh kedua pihak kapan saja.',
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 bg-background">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            Cara Kerja Smart Contract
          </span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Kesepakatan Transparan & Otomatis dari Lahan dan Laut Ke Meja Makan
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Secara teknis, cara kerja smart contract pada GromarContract mengikuti lima langkah aman berikut:
          </p>
        </div>

        <ol className="mt-14 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {steps.map((step, i) => {
            const Icon = step.icon
            const accent = i % 2 === 0 ? 'agro' : 'marine'
            return (
              <li
                key={step.title}
                className="relative flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={
                    accent === 'agro'
                      ? 'flex h-12 w-12 items-center justify-center rounded-2xl bg-agro-soft text-agro'
                      : 'flex h-12 w-12 items-center justify-center rounded-2xl bg-marine-soft text-marine'
                  }
                >
                  <Icon className="h-6 w-6" />
                </div>
                <span className="mt-5 text-sm font-semibold text-muted-foreground">
                  Langkah {i + 1}
                </span>
                <h3 className="mt-1 text-base font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
