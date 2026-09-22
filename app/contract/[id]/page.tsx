'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { contractApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Download,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ExternalLink,
  Clock,
  Loader2,
  Building2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/store/auth'
import { useTranslation } from '@/lib/i18n/use-translation'

export default function ContractDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [contract, setContract] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const currentYear = new Date().getFullYear()

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

    const toastId = toast.loading('Sedang mengunduh dokumen PDF...')
    try {
      const html2pdf = (await import('html2pdf.js')).default
      
      // Clone element to sanitize
      const clone = element.cloneNode(true) as HTMLElement
      // Force white background for the PDF
      clone.style.backgroundColor = '#ffffff'
      clone.style.color = '#000000'
      clone.style.padding = '20px'
      
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename:     `Kontrak-${contract.contractNumber || 'Gromar'}.pdf`,
        image:        { type: 'jpeg' as const, quality: 1 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true,
          backgroundColor: '#ffffff'
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      }
      
      await html2pdf().from(clone).set(opt).save()
      toast.dismiss(toastId)
      toast.success('Surat kontrak resmi berhasil diunduh!')
    } catch (err: any) {
      console.error('PDF Error:', err)
      toast.dismiss(toastId)
      toast.error('Gagal mengunduh PDF. Silakan gunakan fungsi cetak browser (Ctrl+P).')
    }
  }

  const handleUpdateStatus = async (status: 'APPROVED' | 'REJECTED') => {
    if (!contract) return
    setIsProcessing(true)
    try {
      await contractApi.updateStatus(contract.id, status)
      toast.success(status === 'APPROVED' ? 'Kontrak resmi disahkan!' : 'Pengajuan kontrak telah ditolak.')
      await fetchContract()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal memperbarui status kontrak')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 size={36} className="animate-spin text-agro mb-3" />
        <p className="text-sm font-semibold text-muted-foreground">Memuat Dokumen Kontrak Sah...</p>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <XCircle size={48} className="text-destructive mb-3" />
        <h2 className="text-xl font-bold text-foreground">Dokumen Kontrak Tidak Ditemukan</h2>
        <Button onClick={() => router.push('/contract')} className="mt-4">Kembali ke Marketplace Kontrak</Button>
      </div>
    )
  }

  const isAdminOrSeller = user?.role === 'ADMIN' || user?.role === 'SELLER'
  const isApproved = contract.status === 'APPROVED'
  const isPending = contract.status === 'PENDING'
  const isRejected = contract.status === 'REJECTED'
  const isCancelled = contract.status === 'CANCELLED'

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-foreground antialiased flex flex-col">
      <div className="no-print">
        <SiteHeader variant="solid-top" />
      </div>

      <div className="no-print sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/contract')} className="rounded-xl font-semibold gap-1.5 cursor-pointer">
            <ArrowLeft size={16} /> Kembali
          </Button>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
              isApproved
                ? 'bg-green-50 text-green-700 border-green-200'
                : isCancelled
                ? 'bg-red-50 text-red-700 border-red-200'
                : isRejected
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {isApproved
                ? 'KONTRAK SAH & BERJALAN'
                : isCancelled
                ? 'DIBATALKAN RESMI'
                : isRejected
                ? 'DITOLAK'
                : 'MENUNGGU ACC'}
            </span>
            <Button onClick={handleDownloadPDF} size="sm" className="rounded-xl font-bold bg-agro hover:bg-agro/90 text-white cursor-pointer shadow-xs gap-1.5">
              <Download size={15} /> <span>Unduh PDF</span>
            </Button>
            {isAdminOrSeller && isPending && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-border">
                <Button size="sm" disabled={isProcessing} onClick={() => handleUpdateStatus('APPROVED')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs gap-1 cursor-pointer">
                  <CheckCircle2 size={15} /> ACC
                </Button>
                <Button size="sm" variant="destructive" disabled={isProcessing} onClick={() => handleUpdateStatus('REJECTED')} className="font-bold rounded-xl text-xs gap-1 cursor-pointer">
                  <XCircle size={15} /> Tolak
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div id="legal-contract-paper" style={{ padding: '40px', backgroundColor: '#ffffff', color: '#000', fontFamily: 'serif' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Gromar</h2>
              <p style={{ fontSize: '11px', margin: 0 }}>Banda Aceh, Indonesia · gromarcontract@gmail.com</p>
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 'bold', textDecoration: 'underline' }}>SURAT PERJANJIAN PASOKAN KOMODITAS</h1>
              <p style={{ fontSize: '11px', marginTop: '5px' }}>Nomor: {contract.contractNumber || `SPK-GRM/${contract.sector?.toUpperCase() || 'B2B'}/0001/${currentYear}`}</p>
            </div>

            {/* Cancellation Formal Notice on PDF */}
            {isCancelled && (
              <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fda4af', padding: '14px', marginBottom: '25px', borderRadius: '6px' }}>
                <strong style={{ color: '#be123c', display: 'block', fontSize: '13px' }}>STATUS SURAT: DIBATALKAN RESMI (TERMINATED)</strong>
                <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#881337', lineHeight: '1.5' }}>
                  <strong>Alasan Pembatalan:</strong> {contract.cancellationReason || 'Pembatalan resmi atas kesepakatan operasional rantai pasok.'}
                </p>
                {contract.cancelledBy && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#9f1239' }}>
                    Dibatalkan oleh: {contract.cancelledBy} pada {formatDate(contract.cancelledAt || contract.updatedAt)}
                  </p>
                )}
              </div>
            )}

            {/* Parties */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '30px' }}>
              <div style={{ width: '32%' }}>
                <p style={{ fontWeight: 'bold', borderBottom: '1px solid #ccc' }}>I. PIHAK PERTAMA (PEMBELI):</p>
                <p style={{ margin: '4px 0' }}>{contract.user?.name}</p>
                <p style={{ margin: '4px 0' }}>{contract.companyName}</p>
                <p style={{ margin: '4px 0' }}>NIB: {contract.nibOrNik}</p>
              </div>
              <div style={{ width: '32%' }}>
                <p style={{ fontWeight: 'bold', borderBottom: '1px solid #ccc' }}>II. PIHAK KEDUA (PENYEDIA):</p>
                <p style={{ margin: '4px 0' }}>Mitra Produsen {contract.sector}</p>
                <p style={{ margin: '4px 0' }}>{contract.region}</p>
              </div>
              <div style={{ width: '32%' }}>
                <p style={{ fontWeight: 'bold', borderBottom: '1px solid #ccc' }}>III. PIHAK KETIGA (GROMAR):</p>
                <p style={{ margin: '4px 0' }}>Gromar (Escrow)</p>
                <p style={{ margin: '4px 0' }}>Banda Aceh</p>
              </div>
            </div>

            {/* Clauses */}
            <div style={{ fontSize: '13px', lineHeight: '1.6', textAlign: 'justify', marginBottom: '30px' }}>
              <p>Perjanjian pengadaan <strong>{contract.productName}</strong> ({contract.minVolume}) senilai <strong>{contract.price}</strong>.</p>
              <p>Pasal 1: Pihak Kedua menyediakan barang mutu terbaik.</p>
              <p>Pasal 2: Harga dikunci sebesar {contract.price}. Gromar bertindak sebagai penjamin escrow.</p>
              <p>Pasal 3: Pengiriman ke {contract.region}. Durasi: {contract.supplyDuration}.</p>
              <p>Pasal 4: Sengketa diselesaikan melalui arbitrase di Banda Aceh.</p>
              {contract.buyerNotes && <p style={{ backgroundColor: '#f0fdf4', padding: '10px', borderLeft: '3px solid green' }}>Catatan: {contract.buyerNotes}</p>}
            </div>

            {/* Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', fontSize: '11px', marginTop: '50px' }}>
              <div style={{ width: '30%' }}><p>Pihak I</p><div style={{ height: '60px' }}></div><p style={{ borderTop: '1px solid #000' }}>{contract.user?.name}</p></div>
              <div style={{ width: '30%' }}><p>Pihak II</p><div style={{ height: '60px' }}></div><p style={{ borderTop: '1px solid #000' }}>Penyedia</p></div>
              <div style={{ width: '30%' }}><p>Pihak III (Gromar)</p><div style={{ height: '60px' }}></div><p style={{ borderTop: '1px solid #000' }}>Gromar Hub</p></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
