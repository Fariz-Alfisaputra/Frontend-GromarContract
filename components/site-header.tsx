'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X, ShoppingCart, LogOut, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store/auth'
import { useCartStore } from '@/lib/store/cart'
import { CartDrawer } from '@/components/shop/CartDrawer'

const navLinks = [
  { label: 'Toko Segar', href: '/shop' },
  { label: 'Kontrak B2B', href: '/dashboard' },
  { label: 'Features', href: '/#features' },
  { label: 'How it works', href: '/#how' },
  { label: 'FAQ', href: '/#faq' },
]

export function SiteHeader({
  variant = 'solid',
}: {
  variant?: 'overlay' | 'solid'
}) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuthStore()
  const { count, setOpen: setCartOpen, fetchCart } = useCartStore()

  useEffect(() => {
    if (variant === 'solid') return
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [variant])

  useEffect(() => {
    if (user) {
      fetchCart()
    }
  }, [user, fetchCart])

  const solid = variant === 'solid' || scrolled || open

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid
          ? 'border-b border-border/70 bg-background/90 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <a href="/#home" className="flex items-center gap-2.5" aria-label="GROMAR Contract home">
          <Image
            src="/gromar-logo.png"
            alt="GROMAR Contract logo"
            width={44}
            height={44}
            className="h-11 w-11"
            priority
          />
          <span className="gromar-wordmark text-2xl font-extrabold tracking-tight">
            GROMAR
          </span>
        </a>

        <nav className="hidden items-center gap-5 lg:gap-8 md:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                solid
                  ? 'text-muted-foreground hover:text-foreground'
                  : 'text-white/85 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {/* Cart Button */}
              <Button
                variant="ghost"
                onClick={() => setCartOpen(true)}
                className={`relative flex items-center gap-1.5 px-3 ${
                  solid ? 'text-foreground hover:bg-secondary' : 'text-white hover:bg-white/15'
                }`}
              >
                <ShoppingCart size={18} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-agro text-[10px] font-bold text-white">
                    {count}
                  </span>
                )}
              </Button>

              {/* Orders Link */}
              <Link href="/orders">
                <Button
                  variant="ghost"
                  className={`flex items-center gap-1.5 px-3 ${
                    solid ? 'text-foreground hover:bg-secondary' : 'text-white hover:bg-white/15'
                  }`}
                >
                  <Package size={18} />
                  <span>Pesanan</span>
                </Button>
              </Link>

              {/* User Info & Logout */}
              <div className="flex items-center gap-2 lg:gap-3 pl-3 border-l border-border/50">
                <div className="flex flex-col text-right">
                  <span className={`text-xs font-semibold leading-normal ${solid ? 'text-foreground' : 'text-white'}`}>
                    {user.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {user.role === 'SELLER' ? 'Penjual' : user.role === 'BUYER' ? 'Pembeli' : 'Admin'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className={`h-9 w-9 p-0 rounded-full flex items-center justify-center ${
                    solid ? 'text-destructive hover:bg-red-50' : 'text-white/80 hover:bg-white/15 hover:text-white'
                  }`}
                  title="Logout"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className={`text-sm font-semibold ${
                  solid
                    ? 'text-foreground hover:bg-secondary'
                    : 'text-white hover:bg-white/15'
                }`}
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                <Link href="/register">Daftar</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors md:hidden ${
            solid ? 'text-foreground hover:bg-secondary' : 'text-white hover:bg-white/15'
          }`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4" aria-label="Mobile">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-secondary"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border/50 pt-3">
              {user ? (
                <>
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">{user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.role === 'SELLER' ? 'Penjual' : user.role === 'BUYER' ? 'Pembeli' : 'Admin'}
                      </span>
                    </div>
                    <Button variant="ghost" onClick={() => setCartOpen(true)} className="relative">
                      <ShoppingCart size={18} />
                      {count > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-agro text-[9px] font-bold text-white">
                          {count}
                        </span>
                      )}
                    </Button>
                  </div>
                  <Link href="/orders" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-base font-medium text-foreground transition-colors hover:bg-secondary">
                    Pesanan Saya
                  </Link>
                  <Button
                    variant="destructive"
                    onClick={() => { logout(); setOpen(false); }}
                    className="w-full rounded-full font-semibold mt-2"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full rounded-full font-semibold">
                    <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    <Link href="/register" onClick={() => setOpen(false)}>
                      Daftar
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
      <CartDrawer />
    </header>
  )
}
