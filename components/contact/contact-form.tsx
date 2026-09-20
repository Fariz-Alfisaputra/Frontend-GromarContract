'use client'

import { useState } from 'react'
import { Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/use-translation'

export function ContactForm() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('general')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate sending (no backend integration yet)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
    setName('')
    setEmail('')
    setSubject('general')
    setMessage('')
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
          <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="mt-5 text-xl font-extrabold text-foreground">
          {String(t('contact.successTitle'))}
        </h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {String(t('contact.successMessage'))}
        </p>
        <button
          type="button"
          onClick={() => setIsSubmitted(false)}
          className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {String(t('contact.formTitle'))}
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
      <h2 className="text-xl font-extrabold text-foreground">
        {String(t('contact.formTitle'))}
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground">
              {String(t('contact.name'))}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={String(t('contact.namePlaceholder'))}
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground">
              {String(t('contact.email'))}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={String(t('contact.emailPlaceholder'))}
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground">
            {String(t('contact.subject'))}
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none cursor-pointer transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            style={{ appearance: 'auto' }}
          >
            <option value="general">{String(t('contact.subjects.general'))}</option>
            <option value="partnership">{String(t('contact.subjects.partnership'))}</option>
            <option value="support">{String(t('contact.subjects.support'))}</option>
            <option value="feedback">{String(t('contact.subjects.feedback'))}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground">
            {String(t('contact.message'))}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={String(t('contact.messagePlaceholder'))}
            rows={5}
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none resize-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {String(t('contact.sending'))}
            </>
          ) : (
            <>
              <Send size={16} />
              {String(t('contact.send'))}
            </>
          )}
        </button>
      </form>
    </div>
  )
}
