import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { MarketplaceDashboard } from '@/components/dashboard/marketplace-dashboard'

export const metadata = {
  title: 'Kontrak B2B — GROMAR Contract',
  description:
    'Cari, ajukan, dan kelola kontrak pasokan pertanian dan kelautan berjangka secara transparan.',
}

export default async function ContractPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string }>
}) {
  const { sector } = await searchParams
  const initialSector = sector === 'marine' ? 'marine' : 'agro'

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader variant="overlay-auto" />
      <main>
        <MarketplaceDashboard initialSector={initialSector} />
      </main>
      <SiteFooter />
    </div>
  )
}
