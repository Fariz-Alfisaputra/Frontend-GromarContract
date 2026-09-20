'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShoppingCart, LogOut, Package, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store/auth'
import { useCartStore } from '@/lib/store/cart'
import { useTranslation } from '@/lib/i18n/use-translation'
import { LanguageSwitcher, LanguageToggle } from '@/components/language-switcher'

export function SiteHeader({
  variant = 'solid',
}: {
  variant?: 'overlay' | 'solid' | 'overlay-auto' | 'solid-top'
}) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const { user, logout } = useAuthStore()
  const { count, setOpen: setCartOpen, toggleOpen, fetchCart } = useCartStore()
  const { t } = useTranslation()

  const navLinks = [
    { label: String(t('navbar.home')), href: '/' },
    { label: String(t('navbar.marketplace')), href: '/shop' },
    { label: String(t('navbar.contract')), href: '/contract' },
    { label: String(t('navbar.contact')), href: '/contact' },
  ]

  useEffect(() => {
    // Track scroll for both 'overlay' (Home) and 'overlay-auto' (shop/contract)
    if (variant === 'solid') return
    if (variant === 'overlay-auto') {
      const onScroll = () => setScrolled(window.scrollY > 30)
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [variant])

  useEffect(() => {
    if (user) {
      fetchCart()
    }
  }, [user, fetchCart])

  const solid = variant === 'solid' || variant === 'solid-top' || scrolled || open
  // When transparent (not solid): Home uses white text, shop/contract use black text
  const darkText = solid || variant === 'overlay-auto'
  const isSolidTop = variant === 'solid-top'

  // Avatar initials
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : ''

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300 pointer-events-none"
    >
      <div className={`mx-auto flex ${isSolidTop ? 'w-full px-0' : 'max-w-7xl px-4 sm:px-8 pt-3 pb-2'} justify-center`}>
        <div
          className={`pointer-events-auto flex items-center justify-between w-full transition-all duration-500 ease-out ${
            isSolidTop
              ? 'rounded-none border-b border-border bg-background/90 px-4 py-3 shadow-sm backdrop-blur-md sm:px-8'
              : scrolled
              ? 'max-w-5xl rounded-full border border-border/80 bg-background/85 px-6 py-2 shadow-lg shadow-black/5 backdrop-blur-xl'
              : solid
              ? 'w-full rounded-2xl border-b border-border/70 bg-background/90 px-5 py-3 backdrop-blur-md'
              : 'w-full px-2 py-3 bg-transparent'
          }`}
        >
          {/* Logo Brand */}
          <Link href="/" className="group flex items-center gap-2.5" aria-label="GROMAR Contract home">
            <div className="relative overflow-hidden rounded-xl transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/gromar-logo.png"
                alt="GROMAR Contract logo"
                width={44}
                height={44}
                className="h-10 w-10 sm:h-11 sm:w-11"
                priority
              />
            </div>
            <span className="gromar-wordmark text-2xl font-extrabold tracking-tight transition-opacity duration-300 group-hover:opacity-90">
              GROMAR
            </span>
          </Link>

          {/* Desktop Nav Links with Hover Pill */}
          <nav
            onMouseLeave={() => setHoveredIdx(null)}
            className="relative hidden items-center gap-1 md:flex"
            aria-label="Primary"
          >
            {navLinks.map((link, idx) => (
              <a
                key={link.label}
                href={link.href}
                onMouseEnter={() => setHoveredIdx(idx)}
                className={`relative px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                  darkText
                    ? 'text-foreground/80 hover:text-foreground'
                    : 'text-white/85 hover:text-white'
                }`}
              >
                {hoveredIdx === idx && (
                  <motion.div
                    layoutId="hoverHighlight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    className={`absolute inset-0 rounded-full ${
                      darkText
                        ? 'bg-secondary'
                        : 'bg-white/15 backdrop-blur-sm'
                    }`}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </a>
            ))}
          </nav>

          {/* Desktop right side */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                {/* Cart Button */}
                <Button
                  variant="ghost"
                  onClick={toggleOpen}
                  className={`relative flex items-center gap-1.5 rounded-full px-3.5 transition-transform hover:scale-105 ${
                    darkText ? 'text-foreground hover:bg-secondary' : 'text-white hover:bg-white/15'
                  }`}
                >
                  <ShoppingCart size={18} />
                  {count > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-agro text-[10px] font-bold text-white shadow-xs"
                    >
                      {count}
                    </motion.span>
                  )}
                </Button>

                {/* Orders Link */}
                <Link href="/orders">
                  <Button
                    variant="ghost"
                    className={`flex items-center gap-1.5 rounded-full px-3.5 ${
                      darkText ? 'text-foreground hover:bg-secondary' : 'text-white hover:bg-white/15'
                    }`}
                  >
                    <Package size={18} />
                    <span>{String(t('common.orders'))}</span>
                  </Button>
                </Link>

                {/* Avatar → Profile link */}
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 pl-3 border-l border-border/40 group"
                >
                  <div
                    className={`flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full text-xs font-extrabold transition-all group-hover:scale-105 ${
                      darkText
                        ? 'bg-agro/10 text-agro group-hover:bg-agro group-hover:text-white'
                        : 'bg-white/20 text-white group-hover:bg-white/30'
                    }`}
                  >
                    {initials}
                  </div>
                  <div className="flex flex-col text-right">
                    <span className={`text-xs font-bold leading-tight ${darkText ? 'text-foreground' : 'text-white'}`}>
                      {user.name}
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                      {user.role === 'SELLER' ? String(t('common.seller')) : user.role === 'CUSTOMER' ? String(t('common.buyer')) : String(t('common.admin'))}
                    </span>
                  </div>
                </Link>

                {/* Language Switcher */}
                <LanguageSwitcher variant={variant} />

                {/* Logout */}
                <Button
                  variant="ghost"
                  onClick={logout}
                  className={`h-9 w-9 p-0 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${
                    darkText
                      ? 'text-destructive hover:bg-rose-50 dark:hover:bg-rose-950'
                      : 'text-white/80 hover:bg-white/15 hover:text-white'
                  }`}
                  title={String(t('common.logout'))}
                >
                  <LogOut size={16} />
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className={`rounded-full px-5 text-sm font-semibold transition-transform hover:scale-105 ${
                    darkText
                      ? 'text-foreground hover:bg-secondary'
                      : 'text-white hover:bg-white/15'
                  }`}
                >
                  <Link href="/login">{String(t('common.login'))}</Link>
                </Button>
                <Button
                  asChild
                  className="rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-md transition-transform hover:scale-105 hover:bg-primary/90"
                >
                  <Link href="/register">{String(t('common.register'))}</Link>
                </Button>

                {/* Language Switcher */}
                <LanguageSwitcher variant={variant} />
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors md:hidden ${
              darkText ? 'text-foreground hover:bg-secondary' : 'text-white hover:bg-white/15'
            }`}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Animated Menu Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -15, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -15, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto border-b border-border bg-background/95 backdrop-blur-xl md:hidden overflow-hidden shadow-xl"
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-5" aria-label="Mobile">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-bold text-foreground transition-colors hover:bg-secondary"
                >
                  {link.label}
                </a>
              ))}

              <div className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-4">
                {user ? (
                  <>
                    <div className="flex items-center justify-between px-3 py-2">
                      <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-agro/10 text-xs font-extrabold text-agro">
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">{user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.role === 'SELLER' ? String(t('common.seller')) : user.role === 'CUSTOMER' ? String(t('common.buyer')) : String(t('common.admin'))}
                          </span>
                        </div>
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          toggleOpen()
                          setOpen(false)
                        }}
                        className="relative"
                      >
                        <ShoppingCart size={20} />
                        {count > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-agro text-[10px] font-bold text-white">
                            {count}
                          </span>
                        )}
                      </Button>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-base font-semibold text-foreground hover:bg-secondary"
                    >
                      <User size={18} /> {String(t('common.myProfile'))}
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-base font-semibold text-foreground hover:bg-secondary"
                    >
                      <Package size={18} /> {String(t('common.myOrders'))}
                    </Link>

                    {/* Mobile Language Toggle */}
                    <LanguageToggle />

                    <Button
                      variant="destructive"
                      onClick={() => {
                        logout()
                        setOpen(false)
                      }}
                      className="w-full rounded-full font-bold mt-3 h-11"
                    >
                      <LogOut size={16} className="mr-2" /> {String(t('common.logout'))}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" className="w-full rounded-full font-bold h-11">
                      <Link href="/login" onClick={() => setOpen(false)}>
                        {String(t('common.login'))}
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full rounded-full bg-primary font-bold text-primary-foreground hover:bg-primary/90 h-11"
                    >
                      <Link href="/register" onClick={() => setOpen(false)}>
                        {String(t('common.register'))}
                      </Link>
                    </Button>

                    {/* Mobile Language Toggle */}
                    <LanguageToggle />
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
