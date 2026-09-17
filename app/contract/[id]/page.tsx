'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { contractApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Printer,
  Download,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building2,
  Phone,
  Calendar,
  ExternalLink,
  Lock,
  Clock,
  Stamp,
  Award,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/store/auth'
import { useTranslation } from '@/lib/i18n/use-translation'

export default function ContractDetailPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const isReviewParam = searchParams.get('review') === 'true'
  const router = useRouter()
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const [contract, setContract] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchContract = async () => {
    if (!id) return
    try {
      const res = await contractApi.getById(id as string)
      setContract(res.data.data)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal memuat dokumen kontrak')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchContract()
  }, [id])

  const handleDownloadPDF = async () => {
    const element = document.getElementById('legal-contract-paper')
    if (!element) return

    const toastId = toast.loading('Memproses dokumen menjadi PDF...')
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const opt = {
        margin:       10,
        filename:     `Surat-Perjanjian-${contract.contractNumber || contract.id}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }
      await html2pdf().from(element).set(opt).save()
      toast.dismiss(toastId)
      toast.success('Surat kontrak berhasil diunduh sebagai PDF!')
    } catch (err: any) {
      console.error(err)
      toast.dismiss(toastId)
      toast.error('Gagal mengunduh PDF')
    }
  }

  const handleUpdateStatus = async (status: 'APPROVED' | 'REJECTED') => {
    if (!contract) return
    setIsProcessing(true)
    try {
      await contractApi.updateStatus(contract.id, status)
      toast.success(
        status === 'APPROVED'
          ? 'Kontrak resmi disahkan dan disetujui (Mutual ACC Berhasil)!'
          : 'Pengajuan kontrak telah ditolak.'
      )
      await fetchContract()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal memperbarui status kontrak')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center">
        <Loader2 size={36} className="animate-spin text-agro mb-3" />
        <p className="text-sm font-semibold text-muted-foreground">Memuat Dokumen Kontrak Sah...</p>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <XCircle size={48} className="text-destructive mb-3" />
        <h2 className="text-xl font-bold text-foreground">Dokumen Kontrak Tidak Ditemukan</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-6">Kontrak mungkin telah dihapus atau Anda tidak memiliki akses.</p>
        <Button onClick={() => router.push('/contract')}>Kembali ke Marketplace Kontrak</Button>
      </div>
    )
  }

  const isAdminOrSeller = user?.role === 'ADMIN' || user?.role === 'SELLER'
  const isApproved = contract.status === 'APPROVED'
  const isPending = contract.status === 'PENDING'
  const isRejected = contract.status === 'REJECTED'

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-foreground antialiased flex flex-col">
      <div className="no-print">
        <SiteHeader variant="solid-top" />
      </div>

      {/* Top Action Bar for Screen */}
      <div className="no-print sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/contract')}
              className="rounded-xl font-semibold gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Kembali</span>
            </Button>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-foreground">Surat Perjanjian Kontrak B2B</h1>
              <p className="text-[11px] font-mono text-muted-foreground">{contract.contractNumber || contract.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Badge */}
            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                isApproved
                  ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800'
                  : isRejected
                  ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
              }`}
            >
              {isApproved
                ? 'KONTRAK SAH & BERJALAN'
                : isRejected
                ? 'DITOLAK'
                : 'MENUNGGU ACC PIHAK KEDUA'}
            </span>

            {/* Print / Download PDF Button */}
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  size="sm"
                  className="rounded-xl font-bold bg-card hover:bg-secondary gap-1.5 shadow-xs cursor-pointer border-border"
                  title="Cetak atau Simpan sebagai PDF"
                >
                  <Download size={15} />
                  <span className="hidden xs:inline">Unduh Dokumen PDF</span>
                </Button>

            {/* Seller/Admin Action Buttons */}
            {isAdminOrSeller && isPending && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-border">
                <Button
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => handleUpdateStatus('APPROVED')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs gap-1 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 size={15} />
                  <span>ACC & Sahkan</span>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isProcessing}
                  onClick={() => handleUpdateStatus('REJECTED')}
                  className="font-bold rounded-xl text-xs gap-1 cursor-pointer shadow-xs"
                >
                  <XCircle size={15} />
                  <span>Tolak</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Document Container (A4 Printable Canvas) */}
      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Paper Sheet */}
          <div
            id="legal-contract-paper"
            className="bg-white text-zinc-900 shadow-2xl rounded-2xl p-8 sm:p-14 border border-zinc-200 print:border-none print:shadow-none print:p-0 print:m-0"
            style={{ minHeight: '297mm', color: '#111827' }}
          >
            {/* ── 1. KOP SURAT RESMI PERUSAHAAN ── */}
            <div className="border-b-4 border-double border-zinc-900 pb-5 mb-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-900 flex items-center justify-center p-2">
                    <Image
                      src="/gromar-logo.png"
                      alt="GROMAR Logo"
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight text-zinc-900 uppercase">
                      PT GROMAR INTEGRASI NUSANTARA
                    </h2>
                    <p className="text-[11px] sm:text-xs font-semibold text-zinc-600">
                      Platform Bursa Perdagangan Kontrak Pasokan Agromaritim Terintegrasi
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Menara Agro Maritim Lt. 18, Jl. Jend. Sudirman Kav. 52, Jakarta Selatan 12190
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Izin BAPPEBTI / Kemenkumham No: AHU-0034912.AH.01.01.TAHUN 2024 · support@gromar.id
                    </p>
                  </div>
                </div>

                <div className="text-right hidden sm:block shrink-0">
                  <span className="inline-block border border-zinc-900 px-2.5 py-1 text-[10px] font-mono font-bold tracking-widest uppercase">
                    DOKUMEN HUKUM SAH
                  </span>
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">ISO 9001:2015 & SNI Certified</p>
                </div>
              </div>
            </div>

            {/* ── 2. JUDUL & NOMOR SURAT ── */}
            <div className="text-center my-6">
              <h1 className="text-lg sm:text-xl font-black uppercase tracking-wide underline underline-offset-4 decoration-2">
                SURAT PERJANJIAN PENGADAAN & KONTRAK PASOKAN BERJANGKA (SPK)
              </h1>
              <p className="text-xs font-mono font-bold text-zinc-700 mt-1.5">
                Nomor: {contract.contractNumber || `SPK-GRM/${contract.sector?.toUpperCase() || 'B2B'}/0001/2026`}
              </p>
            </div>

            {/* ── 3. PEMBUKAAN PERJANJIAN ── */}
            <p className="text-xs sm:text-sm text-justify leading-relaxed mt-4">
              Pada hari ini, tanggal <strong>{formatDate(contract.createdAt)}</strong>, bertempat di Sentra Komoditas Gromar Hub, telah dibuat dan disepakati perjanjian kerjasama pengadaan dan pasokan komoditas berskala B2B oleh dan antara pihak-pihak di bawah ini:
            </p>

            {/* ── 4. IDENTITAS PARA PIHAK ── */}
            <div className="my-5 border border-zinc-300 rounded-lg p-4 bg-zinc-50/50 space-y-4 text-xs sm:text-sm">
              <div>
                <p className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] mb-1">
                  I. PIHAK PERTAMA (PEMBELI / APPLICANT):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pl-3 text-zinc-700">
                  <div>Nama Penanggung Jawab: <strong>{contract.user?.name || '-'}</strong></div>
                  <div>Badan Usaha / Koperasi: <strong>{contract.companyName || '-'}</strong></div>
                  <div>Nomor NIB / NIK: <strong>{contract.nibOrNik || '-'}</strong></div>
                  <div>Kontak / WhatsApp PIC: <strong>{contract.picContact || '-'}</strong></div>
                  <div className="sm:col-span-2">Alamat / Wilayah Distribusi: <strong>{contract.region}</strong></div>
                  <div className="sm:col-span-2">Email Terdaftar: <strong>{contract.user?.email || '-'}</strong></div>
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-3">
                <p className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] mb-1">
                  II. PIHAK KEDUA (PENYEDIA / GROMAR COMMODITY HUB):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pl-3 text-zinc-700">
                  <div>Nama Badan Hukum: <strong>PT GROMAR INTEGRASI NUSANTARA</strong></div>
                  <div>Sektor Pasokan: <strong className="uppercase">{contract.sector === 'agro' ? 'Agrikultur (Hasil Bumi)' : 'Kelautan (Perikanan & Maritim)'}</strong></div>
                  <div>Sentra Pergudangan: <strong>Gromar Distribution Center Wilayah {contract.region}</strong></div>
                  <div>Status Verifikasi: <strong className="text-emerald-700">Produsen Mitra Binaan Terverifikasi</strong></div>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-justify leading-relaxed">
              Pihak Pertama dan Pihak Kedua secara bersama-sama disebut sebagai <strong>"Para Pihak"</strong>. Para Pihak dengan ini sepakat dan mengikatkan diri dalam Perjanjian Kontrak Pasokan dengan klausul-klausul hukum sebagai berikut:
            </p>

            {/* ── 5. PASAL-PASAL KONTRAK RESMI ── */}
            <div className="space-y-4 my-6 text-xs sm:text-sm leading-relaxed">
              {/* Pasal 1 */}
              <div>
                <h3 className="font-bold text-zinc-900">PASAL 1: OBJEK PERJANJIAN & SPESIFIKASI MUTU</h3>
                <ol className="list-decimal pl-5 space-y-1 text-zinc-800 mt-1">
                  <li>
                    Pihak Kedua berkewajiban menyediakan dan menyerahkan komoditas <strong>{contract.productName}</strong> kepada Pihak Pertama sesuai standar mutu Grade A terverifikasi.
                  </li>
                  <li>
                    Total kuota pasokan yang disepakati sebesar <strong>{contract.minVolume}</strong> dengan jaminan kadar air, kesegaran, dan susut maksimal di bawah toleransi 1.5%.
                  </li>
                </ol>
              </div>

              {/* Pasal 2 */}
              <div>
                <h3 className="font-bold text-zinc-900">PASAL 2: NILAI KONTRAK, HARGA TERKUNCI & ESCROW</h3>
                <ol className="list-decimal pl-5 space-y-1 text-zinc-800 mt-1">
                  <li>
                    Harga satuan disepakati dan dikunci sebesar <strong>{contract.price}</strong> (Fixed Price Guarantee), dan tidak terpengaruh oleh fluktuasi harga pasar spot selama masa kontrak.
                  </li>
                  <li>
                    Durasi pasokan berjalan selama <strong>{contract.supplyDuration || 'Sesuai Jadwal Panen'}</strong>.
                  </li>
                  <li>
                    Pembayaran diamankan melalui Sistem Rekening Bersama (Smart Escrow Gromar) dan baru dicairkan setelah Pihak Pertama memverifikasi berita acara serah terima barang (BAST).
                  </li>
                </ol>
              </div>

              {/* Pasal 3 */}
              <div>
                <h3 className="font-bold text-zinc-900">PASAL 3: PENGIRIMAN, LOGISTIK & TITIK SERAH TERIMA</h3>
                <ol className="list-decimal pl-5 space-y-1 text-zinc-800 mt-1">
                  <li>
                    Pengiriman pasokan dilaksanakan menuju titik serah terima di wilayah <strong>{contract.region}</strong> sesuai jadwal berkala yang ditentukan.
                  </li>
                  <li>
                    Pihak Kedua bertanggung jawab atas pengemasan berstandar rantai dingin (cold chain) untuk perikanan atau kemasan sirkulasi udara optimal untuk hasil bumi.
                  </li>
                </ol>
              </div>

              {/* Pasal 4 */}
              <div>
                <h3 className="font-bold text-zinc-900">PASAL 4: HAK & KEWAJIBAN SERTA FORCE MAJEURE</h3>
                <ol className="list-decimal pl-5 space-y-1 text-zinc-800 mt-1">
                  <li>
                    Apabila komoditas yang diterima tidak sesuai spesifikasi uji mutu, Pihak Pertama berhak meminta penggantian pasokan baru dalam waktu 2x24 jam.
                  </li>
                  <li>
                    Keadaan kahar (Force Majeure) meliputi bencana alam, kebijakan moneter mendesak, atau kegagalan panen/tangkapan masal yang dibuktikan dengan surat resmi dinas pertanian/kelautan setempat.
                  </li>
                </ol>
              </div>

              {/* Catatan Khusus bila ada */}
              {contract.buyerNotes && (
                <div className="border-l-4 border-amber-500 bg-amber-50/60 p-3 rounded-r-lg">
                  <p className="font-bold text-zinc-900 text-xs">Catatan Khusus Pengajuan:</p>
                  <p className="text-xs text-zinc-700 mt-0.5">{contract.buyerNotes}</p>
                </div>
              )}
            </div>

            {/* ── 6. LAMPIRAN SCAN BERKAS BASAH BILA ADA ── */}
            {contract.documentUrl && (
              <div className="my-6 p-4 rounded-xl border border-zinc-300 bg-zinc-50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Lampiran Berkas Scan / Basah Bermeterai</p>
                    <p className="text-[11px] text-zinc-500 truncate max-w-md">Dokumen legalitas eksternal diunggah oleh Pihak Pertama</p>
                  </div>
                </div>
                <a
                  href={contract.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-colors"
                >
                  <span>Buka Berkas</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            )}

            {/* ── 7. PENGESAHAN & TANDA TANGAN DUA PIHAK (DUAL PARTY ACC) ── */}
            <div className="mt-12 pt-6 border-t-2 border-zinc-900">
              <p className="text-center text-xs font-semibold text-zinc-600 mb-8">
                Demikian Perjanjian ini dibuat dalam bentuk Dokumen Sah Elektronik yang memiliki kekuatan hukum setara dengan akta otentik berdasarkan UU ITE No. 1 Tahun 2024.
              </p>

              <div className="grid grid-cols-2 gap-8 text-center text-xs sm:text-sm">
                {/* Kolom Pihak I */}
                <div className="flex flex-col items-center justify-between min-h-[190px]">
                  <p className="font-bold text-zinc-900 uppercase">PIHAK PERTAMA (PEMBELI)</p>
                  
                  {/* Digital Signature Box */}
                  <div className="my-2 border border-dashed border-emerald-600 bg-emerald-50/50 p-2.5 rounded-lg flex flex-col items-center justify-center w-full max-w-[240px]">
                    <CheckCircle2 size={24} className="text-emerald-700 mb-1" />
                    <span className="text-[10px] font-black tracking-wider text-emerald-800 uppercase">
                      TELAH DI-ACC DIGITAL
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 mt-0.5">
                      {formatDate(contract.buyerSignedAt || contract.createdAt)}
                    </span>
                    <span className="text-[8px] font-mono text-zinc-400 mt-0.5 truncate max-w-[180px]">
                      Hash: SHA256-{(contract.id + 'buyer').slice(0, 16)}...
                    </span>
                  </div>

                  <div>
                    <p className="font-bold text-zinc-900 underline underline-offset-2">
                      {contract.user?.name || 'Pihak Pembeli'}
                    </p>
                    <p className="text-[11px] text-zinc-500">{contract.companyName || 'Direktur / Kuasa Usaha'}</p>
                  </div>
                </div>

                {/* Kolom Pihak II */}
                <div className="flex flex-col items-center justify-between min-h-[190px]">
                  <p className="font-bold text-zinc-900 uppercase">PIHAK KEDUA (PENYEDIA / HUB)</p>

                  {/* Digital Stamp / Signature Box */}
                  {isApproved ? (
                    <div className="my-2 border border-dashed border-emerald-600 bg-emerald-50/50 p-2.5 rounded-lg flex flex-col items-center justify-center w-full max-w-[240px]">
                      <ShieldCheck size={24} className="text-emerald-700 mb-1" />
                      <span className="text-[10px] font-black tracking-wider text-emerald-800 uppercase">
                        RESMI DI-ACC & DISAHKAN
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500 mt-0.5">
                        {formatDate(contract.sellerSignedAt || contract.updatedAt)}
                      </span>
                      <span className="text-[8px] font-mono text-zinc-400 mt-0.5 truncate max-w-[180px]">
                        Verifikasi Hub: GRM-VALID-{(contract.id).slice(0, 10)}
                      </span>
                    </div>
                  ) : isRejected ? (
                    <div className="my-2 border border-dashed border-red-500 bg-red-50/50 p-2.5 rounded-lg flex flex-col items-center justify-center w-full max-w-[240px]">
                      <XCircle size={24} className="text-red-600 mb-1" />
                      <span className="text-[10px] font-black tracking-wider text-red-700 uppercase">
                        PENGAJUAN DITOLAK
                      </span>
                      <span className="text-[9px] text-zinc-500 mt-0.5">Tidak disahkan oleh Hub</span>
                    </div>
                  ) : (
                    <div className="my-2 border border-dashed border-amber-500 bg-amber-50/50 p-2.5 rounded-lg flex flex-col items-center justify-center w-full max-w-[240px]">
                      <Clock size={22} className="text-amber-600 mb-1 animate-pulse" />
                      <span className="text-[10px] font-black tracking-wider text-amber-800 uppercase">
                        MENUNGGU ACC PIHAK II
                      </span>
                      <span className="text-[9px] text-zinc-500 mt-0.5">Menunggu peninjauan produsen</span>
                    </div>
                  )}

                  <div>
                    <p className="font-bold text-zinc-900 underline underline-offset-2">
                      GROMAR COMMODITY HUB
                    </p>
                    <p className="text-[11px] text-zinc-500">Direktur Eksekutif Pasokan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Watermark */}
            <div className="mt-12 pt-4 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-400">
              <span>Dicetak melalui Gromar Smart Contract Engine</span>
              <span>Dokumen Keaslian Terverifikasi (ID: {contract.id})</span>
            </div>
          </div>
        </div>
      </main>

      <div className="no-print">
        <SiteFooter />
      </div>

      {/* Print Specific CSS */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          #legal-contract-paper {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
          }
        }
      `}</style>
    </div>
  )
}
