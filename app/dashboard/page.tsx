import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { MarketplaceDashboard } from '@/components/dashboard/marketplace-dashboard'

export const metadata = {
  title: 'Marketplace — GROMAR Contract',
  description:
    'Search and secure transparent agriculture and marine supply contracts in one marketplace.',
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string }>
}) {
  const { sector } = await searchParams
  const initialSector = sector === 'marine' ? 'marine' : 'agro'

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <MarketplaceDashboard initialSector={initialSector} />
      </main>
      <SiteFooter />
    </div>
  )
}
