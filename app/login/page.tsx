'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'
import { useCartStore } from '@/lib/store/cart'
import { Eye, EyeOff, Leaf, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const { login, isLoading } = useAuthStore()
  const { fetchCart } = useCartStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      await fetchCart()
      toast.success('Selamat datang kembali!')
      router.push('/shop')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Login gagal')
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

        <div className="auth-logo">
          <Leaf size={32} />
          <span>GROMAR</span>
        </div>
        <h1 className="auth-title">Masuk ke Akun</h1>
        <p className="auth-subtitle">Belanja produk segar langsung dari petani & nelayan lokal</p>

        <form onSubmit={handleSubmit} className="auth-form">
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
            {isLoading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <p className="auth-switch">
          Belum punya akun?{' '}
          <Link href="/register" className="auth-switch-link">
            Daftar sekarang
          </Link>
        </p>

        <div className="auth-demo">
          <p>Demo akun:</p>
          <p>Customer: <code>user@gromar.id</code> / <code>customer123</code></p>
          <p>Admin: <code>admin@gromar.id</code> / <code>admin123</code></p>
        </div>
      </div>
    </div>
  )
}
