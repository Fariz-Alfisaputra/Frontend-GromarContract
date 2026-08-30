'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/use-translation'

export function SiteFooter() {
  const { t } = useTranslation()

  const platformLinks = (t('footer.linksPlatform') as unknown as string[]) || []
  const companyLinks = (t('footer.linksCompany') as unknown as string[]) || []
  const resourceLinks = (t('footer.linksResources') as unknown as string[]) || []

  // Company links map to real pages (last item is Contact)
  const companyHrefs = ['#', '#', '#', '/contact']

  const columns = [
    { title: String(t('footer.platform')), links: platformLinks, hrefs: ['#', '#', '#', '#'] },
    { title: String(t('footer.company')), links: companyLinks, hrefs: companyHrefs },
    { title: String(t('footer.resources')), links: resourceLinks, hrefs: ['#', '#', '#', '#'] },
  ]

  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-background">
                <Image
                  src="/gromar-logo.png"
                  alt="GROMAR Contract logo"
                  width={36}
                  height={36}
                  className="h-9 w-9"
                />
              </span>
              <span className="text-2xl font-extrabold tracking-tight text-footer-foreground">
                GROMAR
              </span>
            </div>
            <p className="mt-5 max-w-sm text-pretty leading-relaxed text-footer-foreground/70">
              {String(t('footer.description'))}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold text-footer-foreground">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link, i) => (
                    <li key={link}>
                      {col.hrefs[i] === '/contact' ? (
                        <Link
                          href="/contact"
                          className="text-sm text-footer-foreground/70 transition-colors hover:text-footer-foreground"
                        >
                          {link}
                        </Link>
                      ) : (
                        <a
                          href={col.hrefs[i]}
                          className="text-sm text-footer-foreground/70 transition-colors hover:text-footer-foreground"
                        >
                          {link}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-footer-foreground/15 pt-8 sm:flex-row sm:items-center">
          <p className="text-sm text-footer-foreground/60">
            {String(t('footer.copyright'))}
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-footer-foreground/60 transition-colors hover:text-footer-foreground">
              {String(t('footer.privacy'))}
            </a>
            <a href="#" className="text-sm text-footer-foreground/60 transition-colors hover:text-footer-foreground">
              {String(t('footer.terms'))}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
