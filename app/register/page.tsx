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

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('BUYER') // Default is BUYER (Pembeli)
  const [showPass, setShowPass] = useState(false)
  const { register, isLoading } = useAuthStore()
  const { fetchCart } = useCartStore()
  const { t } = useTranslation()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error(String(t('auth.passwordMin')))
      return
    }
    try {
      await register(name, email, password, role)
      await fetchCart()
      toast.success(String(t('auth.successRegister')))
      router.push('/shop')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || String(t('auth.registerFail')))
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
        <h1 className="auth-title">{String(t('auth.registerTitle'))}</h1>
        <p className="auth-subtitle">{String(t('auth.registerSubtitle'))}</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">{String(t('auth.fullName'))}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder={String(t('auth.namePlaceholder'))}
              required
              minLength={2}
            />
          </div>

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
            <label className="form-label">{String(t('auth.roleLabel'))}</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-input"
              style={{ cursor: 'pointer', appearance: 'auto' }}
              required
            >
              <option value="BUYER">{String(t('auth.buyerOption'))}</option>
              <option value="SELLER">{String(t('auth.sellerOption'))}</option>
            </select>
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
            {isLoading ? String(t('auth.registerLoading')) : String(t('auth.registerNow'))}
          </button>
        </form>

        <p className="auth-switch">
          {String(t('auth.hasAccount'))}{' '}
          <Link href="/login" className="auth-switch-link">
            {String(t('auth.loginHere'))}
          </Link>
        </p>
      </div>
    </div>
  )
}
