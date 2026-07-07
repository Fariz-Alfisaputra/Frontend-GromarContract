import { Suspense } from 'react'
import { CheckoutSuccessClient } from './success-client'

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="success-page"><div className="success-card">Memuat...</div></div>}>
      <CheckoutSuccessClient />
    </Suspense>
  )
}
