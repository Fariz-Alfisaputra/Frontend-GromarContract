'use client'

import { Mail, MapPin, Clock } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ContactForm } from '@/components/contact/contact-form'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/use-translation'

export default function ContactPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <SiteHeader variant="overlay-auto" />

      <div className="mx-auto max-w-6xl px-5 pt-28 pb-20 sm:px-8">
        {/* Hero */}
        <ScrollReveal direction="up" distance={30}>
          <div className="mx-auto max-w-2xl text-center mb-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-bold text-primary shadow-sm">
              <Mail size={14} />
              {String(t('contact.heroBadge'))}
            </span>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              {String(t('contact.title'))}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {String(t('contact.subtitle'))}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          {/* Form */}
          <ScrollReveal direction="right" distance={40} delay={0.1}>
            <ContactForm />
          </ScrollReveal>

          {/* Info */}
          <ScrollReveal direction="left" distance={40} delay={0.2}>
            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-border bg-card p-7 shadow-sm">
                <h3 className="text-lg font-extrabold text-foreground">
                  {String(t('contact.infoTitle'))}
                </h3>

                <div className="mt-6 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                        {String(t('contact.emailLabel'))}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">
                        {String(t('contact.emailValue'))}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                        {String(t('contact.addressLabel'))}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">
                        {String(t('contact.addressValue'))}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                        {String(t('contact.hoursLabel'))}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">
                        {String(t('contact.hoursValue'))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="relative h-64 overflow-hidden rounded-3xl border border-border bg-secondary/50 shadow-sm">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={32} className="mx-auto text-muted-foreground/50" />
                    <p className="mt-2 text-sm font-semibold text-muted-foreground">
                      Jakarta, Indonesia
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
