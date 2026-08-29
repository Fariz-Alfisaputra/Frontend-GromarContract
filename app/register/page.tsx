'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'
import { useCartStore } from '@/lib/store/cart'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('BUYER') // Default is BUYER (Pembeli)
  const [showPass, setShowPass] = useState(false)
  const { register, isLoading } = useAuthStore()
  const { fetchCart } = useCartStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }
    try {
      await register(name, email, password, role)
      await fetchCart()
      toast.success('Akun berhasil dibuat! Selamat berbelanja')
      router.push('/shop')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Registrasi gagal')
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
          <ArrowLeft size={16} /> Kembali
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
        <h1 className="auth-title">Buat Akun Baru</h1>
        <p className="auth-subtitle">Bergabung dengan Gromar dan nikmati produk segar terbaik</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="Nama Anda"
              required
              minLength={2}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="email@contoh.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Daftar Sebagai</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-input"
              style={{ cursor: 'pointer', appearance: 'auto' }}
              required
            >
              <option value="BUYER">Pembeli (Customer)</option>
              <option value="SELLER">Penjual (Merchant)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Minimal 6 karakter"
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
            {isLoading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="auth-switch">
          Sudah punya akun?{' '}
          <Link href="/login" className="auth-switch-link">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
