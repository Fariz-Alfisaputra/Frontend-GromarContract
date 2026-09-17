'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { contractApi, uploadApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  FileSignature,
  ArrowLeft,
  UploadCloud,
  FileCheck,
  Building2,
  Phone,
  Calendar,
  ShieldCheck,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/store/auth'
import { useTranslation } from '@/lib/i18n/use-translation'

function NewContractForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const { t } = useTranslation()

  const productName = searchParams.get('product') || 'Premium White Rice'
  const sector = searchParams.get('sector') || 'agro'
  const region = searchParams.get('region') || 'Karawang, West Java'
  const price = searchParams.get('price') || 'Rp 11,500'
  const unit = searchParams.get('unit') || 'kg'
  const minVolume = searchParams.get('minVolume') || '5 tons'

  const [volume, setVolume] = useState(minVolume)
  const [customPrice, setCustomPrice] = useState(price)
  const [customRegion, setCustomRegion] = useState(region)
  const [companyName, setCompanyName] = useState('')
  const [nibOrNik, setNibOrNik] = useState('')
  const [picContact, setPicContact] = useState('')
  const [supplyDuration, setSupplyDuration] = useState('3 Bulan (Pasokan Rutin Mingguan)')
  const [buyerNotes, setBuyerNotes] = useState('')

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)
  const [buyerAgreed, setBuyerAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    if (user.name) {
      setCompanyName(`PT / Koperasi ${user.name}`)
    }
  }, [user, router])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 10MB')
      return
    }

    setUploadedFileName(file.name)
    const toastId = toast.loading('Mengunggah dokumen kontrak...')

    try {
      const res = await uploadApi.uploadDocument(file)
      const fileUrl = res.data.url
      setUploadedFileUrl(fileUrl)
      toast.dismiss(toastId)
      toast.success(`Berhasil mengunggah dokumen: ${file.name}`)
    } catch (err: any) {
      toast.dismiss(toastId)
      toast.error(err?.response?.data?.message || 'Gagal mengunggah dokumen')
      const previewUrl = URL.createObjectURL(file)
      setUploadedFileUrl(previewUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!buyerAgreed) {
      toast.error('Silakan setujui pernyataan kepatuhan hukum terlebih dahulu.')
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading('Mengirim pengajuan kontrak B2B...')

    try {
      await contractApi.create({
        sector,
        productName,
        minVolume: volume,
        price: customPrice,
        region: customRegion,
        companyName: companyName.trim() || undefined,
        nibOrNik: nibOrNik.trim() || undefined,
        picContact: picContact.trim() || undefined,
        supplyDuration: supplyDuration || undefined,
        documentUrl: uploadedFileUrl || undefined,
        buyerNotes: buyerNotes.trim() || undefined,
      })
      toast.dismiss(toastId)
      toast.success('Pengajuan kontrak B2B berhasil dikirim!')
      router.push('/contract?sector=' + sector)
    } catch (err: any) {
      toast.dismiss(toastId)
      toast.error(err?.response?.data?.message || 'Gagal mengirim pengajuan kontrak')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-foreground flex flex-col">
      <SiteHeader variant="solid-top" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-8 py-24 sm:py-28">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/contract?sector=' + sector)}
            className="rounded-xl font-semibold gap-1.5 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Marketplace Kontrak</span>
          </Button>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-xl">
          <div className="flex items-center gap-3 border-b border-border pb-6 mb-6">
            <div className={`p-3 rounded-2xl ${sector === 'agro' ? 'bg-agro/10 text-agro' : 'bg-marine/10 text-marine'}`}>
              <FileSignature size={26} />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                Pengajuan Kontrak B2B Resmi
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-foreground mt-0.5">{productName}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Kunci volume dan harga pasokan langsung dengan produsen di wilayah {region}.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Building2 size={16} className="text-agro" />
                <span>1. Identitas Entitas & Legalitas Usaha</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Nama Badan Usaha / PT / Koperasi</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Contoh: PT Tani Makmur Sejahtera"
                    className="w-full h-11 border border-border rounded-xl px-3.5 text-sm bg-background text-foreground outline-none focus:border-agro transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Nomor NIB / NIK Penanggung Jawab</label>
                  <input
                    type="text"
                    value={nibOrNik}
                    onChange={(e) => setNibOrNik(e.target.value)}
                    placeholder="Contoh: 9120001234567"
                    className="w-full h-11 border border-border rounded-xl px-3.5 text-sm bg-background text-foreground outline-none focus:border-agro transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Nomor WhatsApp PIC / Kontrak</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={picContact}
                      onChange={(e) => setPicContact(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full h-11 border border-border rounded-xl pl-10 pr-3.5 text-sm bg-background text-foreground outline-none focus:border-agro transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Durasi Kontrak Pasokan</label>
                  <select
                    value={supplyDuration}
                    onChange={(e) => setSupplyDuration(e.target.value)}
                    className="w-full h-11 border border-border rounded-xl px-3 text-sm bg-background text-foreground outline-none focus:border-agro transition-colors cursor-pointer"
                  >
                    <option value="1 Bulan (Spot Kontrak)">1 Bulan (Spot Kontrak)</option>
                    <option value="3 Bulan (Pasokan Rutin Mingguan)">3 Bulan (Pasokan Rutin Mingguan)</option>
                    <option value="6 Bulan (Kontrak Semester Berjangka)">6 Bulan (Kontrak Semester Berjangka)</option>
                    <option value="12 Bulan (Kontrak Tahunan Penuh)">12 Bulan (Kontrak Tahunan Penuh)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Calendar size={16} className="text-agro" />
                <span>2. Parameter Volume & Harga Kunci</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Volume ({unit})</label>
                  <input
                    type="text"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="w-full h-11 border border-border rounded-xl px-3.5 text-sm bg-background text-foreground outline-none focus:border-agro transition-colors"
                    required
                  />
                  <span className="text-[10px] text-muted-foreground">Minimal: {minVolume}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Harga per {unit} (IDR)</label>
                  <input
                    type="text"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full h-11 border border-border rounded-xl px-3.5 text-sm bg-background text-foreground outline-none focus:border-agro transition-colors"
                    required
                  />
                  <span className="text-[10px] text-muted-foreground">Acuan Pasar: {price}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Wilayah Distribusi</label>
                  <input
                    type="text"
                    value={customRegion}
                    onChange={(e) => setCustomRegion(e.target.value)}
                    className="w-full h-11 border border-border rounded-xl px-3.5 text-sm bg-background text-foreground outline-none focus:border-agro transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                <UploadCloud size={16} className="text-agro" />
                <span>3. Unggah Dokumen / Surat Pernyataan Sah (Opsional)</span>
              </h2>

              <div className="border-2 border-dashed border-border hover:border-agro/50 transition-colors rounded-2xl p-6 text-center bg-card/50 relative">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center">
                  {uploadedFileName ? (
                    <>
                      <FileCheck size={32} className="text-agro mb-2" />
                      <p className="text-sm font-bold text-foreground">{uploadedFileName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Berhasil diunggah. Klik untuk mengganti.</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={32} className="text-muted-foreground mb-2" />
                      <p className="text-sm font-bold text-foreground">Seret berkas atau klik untuk unggah PDF / Scan Basah</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Format PDF, JPG, PNG (Maksimal 10MB)</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Catatan Tambahan untuk Produsen (Opsional)</label>
                <textarea
                  value={buyerNotes}
                  onChange={(e) => setBuyerNotes(e.target.value)}
                  placeholder="Keterangan pengiriman khusus, spesifikasi pengemasan, atau jadwal terima..."
                  rows={3}
                  className="w-full border border-border rounded-xl p-3 text-sm bg-background text-foreground outline-none focus:border-agro transition-colors resize-none"
                />
              </div>

              <label className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/60 border border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={buyerAgreed}
                  onChange={(e) => setBuyerAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-agro focus:ring-agro accent-agro cursor-pointer"
                  required
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  Saya menyatakan bahwa seluruh data perusahaan dan volume pasokan yang diajukan adalah benar, sah secara hukum, dan saya menyetujui ikatan Perjanjian Jual Beli Berjangka sesuai hukum perdagangan Republik Indonesia serta regulasi platform Gromar Contract.
                </span>
              </label>
            </div>

            <div className="pt-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/contract?sector=' + sector)}
                className="w-1/2 rounded-full font-bold h-12 border-border cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !buyerAgreed}
                className={`w-1/2 rounded-full font-bold h-12 text-white cursor-pointer ${
                  sector === 'agro' ? 'bg-agro hover:bg-agro/90' : 'bg-marine hover:bg-marine/90'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Mengirim Pengajuan...
                  </>
                ) : (
                  'Kirim Pengajuan Kontrak'
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

export default function NewContractPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
      <NewContractForm />
    </Suspense>
  )
}
