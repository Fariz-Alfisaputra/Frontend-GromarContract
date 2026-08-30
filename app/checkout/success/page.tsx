'use client'

import { Suspense } from 'react'
import { CheckoutSuccessClient } from './success-client'
import { useTranslation } from '@/lib/i18n/use-translation'

export default function CheckoutSuccessPage() {
  const { t } = useTranslation()
  return (
    <Suspense fallback={<div className="success-page"><div className="success-card">{String(t('checkoutSuccess.loading'))}</div></div>}>
      <CheckoutSuccessClient />
    </Suspense>
  )
}
