'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { Search, User, Heart, ShoppingBag, Menu, X, MapPin, ChevronDown, ChevronRight, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/lib/store'
import { useWishlistStore } from '@/lib/wishlist-store'
import { useAuthStore } from '@/lib/auth-store'
import { useSettings } from '@/components/SettingsProvider'
import { womenMegaMenu, menMegaMenu, accessoriesMegaMenu } from '@/lib/mega-menu-data'
import { MegaMenuSection } from '@/lib/types'
import CartDrawer from './CartDrawer'
import SearchModal from './SearchModal'
import LanguageSwitcher from './LanguageSwitcher'

const defaultMenus: Record<string, MegaMenuSection> = {
  Women: womenMegaMenu,
  Men: menMegaMenu,
  Accessories: accessoriesMegaMenu,
}

const topLinks = [
  { label: 'New Arrivals', href: '/collections/new-arrivals' },
  { label: 'Premium', href: '/collections/premium' },
  { label: 'Bestsellers', href: '/collections/best-sellers' },
  { label: 'Contact', href: '/pages/get-in-touch' },
]

export default function Header({ transparent = false }: { transparent?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null)
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { toggleCart, totalItems } = useCartStore()
  const { totalItems: wishlistCount } = useWishlistStore()
  const { isAuthenticated, user, logout } = useAuthStore()
  const settings = useSettings()

  const navLinks = useMemo(() => {
    let menus: MegaMenuSection[] = []
    try {
      const raw = settings.mega_menu
      if (raw && raw !== '[]') {
        menus = typeof raw === 'string' ? JSON.parse(raw) : raw
      }
    } catch {}

    if (menus.length === 0) {
      return [
        { label: 'Women', href: '/collections/women', megaMenu: womenMegaMenu },
        { label: 'Men', href: '/collections/men', megaMenu: menMegaMenu },
        { label: 'Accessories', href: '/collections/accessories', megaMenu: accessoriesMegaMenu },
      ]
    }

    return menus.map((m) => ({
      label: m.title,
      href: `/collections/${m.title.toLowerCase()}`,
      megaMenu: m,
    }))
  }, [settings.mega_menu])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  useEffect(() => {
    return () => {
      if (megaMenuTimeoutRef.current) {
        clearTimeout(megaMenuTimeoutRef.current)
      }
    }
  }, [])

  const handleMegaMenuEnter = (label: string) => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current)
      megaMenuTimeoutRef.current = null
    }
    setActiveMegaMenu(label)
  }

  const handleMegaMenuLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null)
    }, 150)
  }

  return (
    <>
      {/* Main Header */}
      <header
        className={cn(
          'top-0 left-0 right-0 z-50 transition-all duration-500',
          transparent ? 'absolute' : 'sticky',
          transparent
            ? isScrolled
              ? 'bg-white/98 backdrop-blur-xl shadow-sm border-b border-black/5'
              : 'bg-transparent'
            : 'bg-white border-b border-black/8 shadow-sm'
        )}
      >
        {/* Announcement Bar */}
        {settings.announcement_bar && (
          <div className="bg-marvvn-black text-white py-2 overflow-hidden">
            <div className="marquee-container whitespace-nowrap text-sm font-medium">
              {[...Array(6)].map((_, i) => (
                <span key={i} className="inline-block px-8 shrink-0">
                  {settings.announcement_bar}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Logo center, Nav left, Icons right — Bonkers Corner layout */}
        <div className="container">
          <div className="flex items-center h-16 lg:h-20 relative">

            {/* Mobile Menu Button — leftmost */}
            <button
              type="button"
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className={cn('w-6 h-6 transition-colors', (transparent && !isScrolled) ? 'text-white' : 'text-black')} />
            </button>

            {/* Desktop Navigation — Left side */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 h-full flex-1">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => handleMegaMenuEnter(link.label)}
                  onMouseLeave={handleMegaMenuLeave}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      'text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1',
                      (transparent && !isScrolled) ? 'text-white hover:text-white/70' : 'text-black hover:text-black/60'
                    )}
                  >
                    {link.label}
                    <ChevronDown className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </nav>

            {/* Logo — Absolute center */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 z-10">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt={settings.store_name || 'MARVVN'} className={cn('h-7 lg:h-9 transition-all', (transparent && !isScrolled) ? 'brightness-0 invert' : '')} />
              ) : (
                <span className={cn('text-xl lg:text-2xl font-black uppercase tracking-[0.15em] transition-colors', (transparent && !isScrolled) ? 'text-white' : 'text-black')}>
                  {settings.store_name || 'MARVVN'}
                </span>
              )}
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-1 lg:gap-2 ml-auto">
              <button
                type="button"
                className={cn('p-2 transition-colors', (transparent && !isScrolled) ? 'text-white hover:text-white/70' : 'text-black hover:text-black/60')}
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Account */}
              <div className="relative hidden lg:block" ref={userMenuRef}>
                <button
                  type="button"
                  className={cn('p-2 transition-colors', (transparent && !isScrolled) ? 'text-white hover:text-white/70' : 'text-black hover:text-black/60')}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="Account"
                >
                  <User className="w-5 h-5" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-black/10 shadow-xl z-50">
                    {isAuthenticated ? (
                      <div className="p-4">
                        <p className="text-sm font-bold">{user?.name}</p>
                        <p className="text-xs text-marvvn-gray-500 mt-0.5">{user?.email}</p>
                        <div className="border-t mt-3 pt-3 space-y-2">
                          <Link href="/account" className="block text-sm font-medium hover:text-marvvn-gray-600" onClick={() => setUserMenuOpen(false)}>
                            My Account
                          </Link>
                          <Link href="/account/orders" className="block text-sm font-medium hover:text-marvvn-gray-600" onClick={() => setUserMenuOpen(false)}>
                            Orders
                          </Link>
                          <button
                            type="button"
                            onClick={async () => { await logout(); setUserMenuOpen(false) }}
                            className="flex items-center gap-2 text-sm text-marvvn-red hover:text-marvvn-red/80"
                          >
                            <LogOut className="w-4 h-4" /> Logout
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 space-y-2">
                        <Link href="/account/login" className="block w-full text-center text-xs font-bold uppercase tracking-widest py-2.5 bg-black text-white hover:bg-black/80 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          Login
                        </Link>
                        <Link href="/account/register" className="block w-full text-center text-xs font-bold uppercase tracking-widest py-2.5 border border-black text-black hover:bg-black hover:text-white transition-colors" onClick={() => setUserMenuOpen(false)}>
                          Register
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className={cn('p-2 transition-colors relative hidden lg:flex', (transparent && !isScrolled) ? 'text-white hover:text-white/70' : 'text-black hover:text-black/60')}
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-black text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlistCount()}
                  </span>
                )}
              </Link>

              <button
                type="button"
                className={cn('p-2 transition-colors relative', (transparent && !isScrolled) ? 'text-white hover:text-white/70' : 'text-black hover:text-black/60')}
                onClick={toggleCart}
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-black text-white text-[10px] font-bold flex items-center justify-center">
                    {totalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mega Menu - Desktop — glassmorphism */}
        {activeMegaMenu && navLinks.map((link) => link.label === activeMegaMenu && (
          <div
            key={link.label}
            className="absolute left-0 right-0 top-full border-t border-white/20 shadow-2xl transition-all duration-300 animate-slide-down"
            style={{
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            }}
            onMouseEnter={() => handleMegaMenuEnter(link.label)}
            onMouseLeave={handleMegaMenuLeave}
          >
            {/* Frosted inner gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-white/10 pointer-events-none" />

            <div className="container py-10 relative z-10">
              <div className="grid grid-cols-4 gap-10">
                {link.megaMenu.columns.map((column) => (
                  <div key={column.title}>
                    <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-black mb-5 pb-2 border-b border-black/10">
                      {column.title}
                    </h3>
                    <ul className="space-y-1.5">
                      {column.links.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            className="block text-sm text-black/60 hover:text-black hover:bg-black/5 px-2 py-1 -mx-2 transition-all duration-150 rounded-sm"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {link.megaMenu.featuredImage && (
                  <div className="relative group overflow-hidden rounded-sm">
                    <Link href={link.megaMenu.featuredImage.href}>
                      <div className="aspect-[3/4] bg-black/5">
                        <img
                          src={link.megaMenu.featuredImage.src}
                          alt={link.megaMenu.featuredImage.alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="text-sm font-bold uppercase text-white drop-shadow-md">{link.megaMenu.featuredImage.label}</span>
                        <div className="flex items-center gap-1 text-xs text-white/80 mt-1 drop-shadow-sm">
                          Shop <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-xl font-display font-bold">{settings.store_name || 'MARVVN'}</span>
          <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="overflow-y-auto h-[calc(100vh-64px)]">
          {navLinks.map((link) => (
            <div key={link.label} className="border-b">
              <button
                type="button"
                className="flex items-center justify-between w-full p-4 text-left font-medium uppercase text-sm tracking-wider"
                onClick={() => setExpandedMobile(expandedMobile === link.label ? null : link.label)}
              >
                {link.label}
                <ChevronDown className={cn(
                  'w-4 h-4 transition-transform',
                  expandedMobile === link.label && 'rotate-180'
                )} />
              </button>
              {expandedMobile === link.label && (
                <div className="pl-4 pb-4 space-y-4">
                  {link.megaMenu.columns.map((column) => (
                    <div key={column.title}>
                      <h4 className="text-xs font-medium uppercase text-marvvn-gray-400 mb-2">{column.title}</h4>
                      <ul className="space-y-2">
                        {column.links.map((item) => (
                          <li key={item.label}>
                            <Link
                              href={item.href}
                              className="text-sm text-marvvn-gray-600 hover:text-marvvn-black"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="p-4 space-y-4">
            <Link href="/pages/store-locator" className="flex items-center gap-2 text-sm" onClick={() => setMobileMenuOpen(false)}>
              <MapPin className="w-4 h-4" /> Store Locator
            </Link>
            <Link href="/pages/get-in-touch" className="block text-sm" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>
            <div className="border-t pt-4 space-y-3">
              {isAuthenticated ? (
                <>
                  <Link href="/account" className="block text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                    My Account
                  </Link>
                  <button type="button" onClick={async () => { await logout(); setMobileMenuOpen(false) }} className="text-sm text-marvvn-red">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/account/login" className="block btn-primary text-center text-sm" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/account/register" className="block btn-secondary text-center text-sm" onClick={() => setMobileMenuOpen(false)}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Search Modal */}
      {searchOpen && <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />}
    </>
  )
}
