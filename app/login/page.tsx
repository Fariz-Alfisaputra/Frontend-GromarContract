'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'
import { useCartStore } from '@/lib/store/cart'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n/use-translation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const { login, isLoading } = useAuthStore()
  const { fetchCart } = useCartStore()
  const { t } = useTranslation()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      await fetchCart()
      toast.success(String(t('auth.welcomeBack')))
      router.push('/shop')
    } catch (error: any) {
      console.error(error)

      const statusCode = error?.response?.status
      const serverMessage = error?.response?.data?.message

      if (!error?.response) {
        toast.error(String(t('auth.serverError')))
        return
      }

      toast.error(
        serverMessage ||
          `${String(t('auth.loginFail'))}${statusCode ? ` (HTTP ${statusCode})` : ''}`
      )
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button
          onClick={() => router.back()}
          className="auth-back-btn"
          type="button"
        >
          <ArrowLeft size={16} /> {String(t('auth.backButton'))}
        </button>

        <Link href="/" className="auth-logo hover:opacity-90 transition-opacity">
          <Image
            src="/gromar-logo.png"
            alt="Logo Gromar"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <span className="gromar-wordmark text-2xl font-extrabold tracking-tight">GROMAR</span>
        </Link>
        <h1 className="auth-title">{String(t('auth.loginTitle'))}</h1>
        <p className="auth-subtitle">{String(t('auth.loginSubtitle'))}</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">{String(t('auth.email'))}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder={String(t('auth.emailPlaceholder'))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{String(t('auth.password'))}</label>
            <div className="form-input-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder={String(t('auth.passwordPlaceholder'))}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="form-input-icon"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="auth-submit-btn">
            {isLoading ? String(t('auth.loginLoading')) : String(t('auth.loginButton'))}
          </button>
        </form>

        <p className="auth-switch">
          {String(t('auth.noAccount'))}{' '}
          <Link href="/register" className="auth-switch-link">
            {String(t('auth.registerLink'))}
          </Link>
        </p>

        <div className="auth-demo">
          <p>{String(t('auth.demoTitle'))}</p>
          <p>{String(t('auth.customerDemo'))} <code>user@gromar.id</code> / <code>customer123</code></p>
          <p>{String(t('auth.adminDemo'))} <code>admin@gromar.id</code> / <code>admin123</code></p>
        </div>
      </div>
    </div>
  )
}
