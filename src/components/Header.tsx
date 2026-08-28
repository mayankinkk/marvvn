'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, User, Heart, ShoppingBag, Menu, X, MapPin, ChevronDown, ChevronRight, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/lib/store'
import { useWishlistStore } from '@/lib/wishlist-store'
import { useAuthStore } from '@/lib/auth-store'
import { useSettings } from '@/components/SettingsProvider'
import { womenMegaMenu, menMegaMenu, accessoriesMegaMenu } from '@/lib/mega-menu-data'
import CartDrawer from './CartDrawer'
import SearchModal from './SearchModal'
import LanguageSwitcher from './LanguageSwitcher'

const navLinks = [
  { label: 'Women', href: '/collections/women', megaMenu: womenMegaMenu },
  { label: 'Men', href: '/collections/men', megaMenu: menMegaMenu },
  { label: 'Accessories', href: '/collections/accessories', megaMenu: accessoriesMegaMenu },
]

const topLinks = [
  { label: 'New Arrivals', href: '/collections/new-arrivals' },
  { label: 'Premium', href: '/collections/premium' },
  { label: 'Bestsellers', href: '/collections/best-sellers' },
  { label: 'Contact', href: '/pages/get-in-touch' },
]

export default function Header() {
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
      {/* Announcement Bar */}
      {settings.announcement_bar && (
        <div className="bg-marvvn-black text-white py-2 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap text-sm font-medium">
            <span className="inline-block px-8">
              {settings.announcement_bar}
            </span>
            <span className="inline-block px-8">
              {settings.announcement_bar}
            </span>
            <span className="inline-block px-8">
              {settings.announcement_bar}
            </span>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header
        className={cn(
          'sticky top-0 z-50 bg-white transition-all duration-300',
          isScrolled ? 'shadow-md' : ''
        )}
      >
        {/* Top Nav */}
        <div className="hidden lg:block border-b border-marvvn-gray-100">
          <div className="container flex items-center justify-between py-2 text-xs text-marvvn-gray-500">
            <div className="flex items-center gap-4">
              <Link href="/pages/store-locator" className="flex items-center gap-1 hover:text-marvvn-black transition-colors">
                <MapPin className="w-3 h-3" />
                Store Locator
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              {topLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="hover:text-marvvn-black transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Logo and Main Nav */}
        <div className="container">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <button
              type="button"
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="relative z-10">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt={settings.store_name || 'MARVVN'} className="h-8 lg:h-10" />
              ) : (
                <span className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
                  {settings.store_name || 'MARVVN'}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 h-full">
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
                      'text-sm font-medium uppercase tracking-wider hover:text-marvvn-gray-600 transition-colors flex items-center gap-1'
                    )}
                  >
                    {link.label}
                    <ChevronDown className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 lg:gap-3">
              <button type="button" className="p-2 hover:bg-marvvn-gray-50 rounded-full transition-colors" onClick={() => setSearchOpen(true)} aria-label="Search">
                <Search className="w-5 h-5" />
              </button>

              {/* Account */}
              <div className="relative hidden lg:block" ref={userMenuRef}>
                <button
                  type="button"
                  className="p-2 hover:bg-marvvn-gray-50 rounded-full transition-colors"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="Account"
                >
                  <User className="w-5 h-5" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-marvvn-gray-200 shadow-lg z-50">
                    {isAuthenticated ? (
                      <div className="p-4">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-marvvn-gray-500 mt-0.5">{user?.email}</p>
                        <div className="border-t mt-3 pt-3 space-y-2">
                          <Link href="/account" className="block text-sm hover:text-marvvn-gray-600" onClick={() => setUserMenuOpen(false)}>
                            My Account
                          </Link>
                          <Link href="/account/orders" className="block text-sm hover:text-marvvn-gray-600" onClick={() => setUserMenuOpen(false)}>
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
                        <Link href="/account/login" className="block w-full btn-primary text-center text-sm py-2" onClick={() => setUserMenuOpen(false)}>
                          Login
                        </Link>
                        <Link href="/account/register" className="block w-full btn-secondary text-center text-sm py-2" onClick={() => setUserMenuOpen(false)}>
                          Register
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link href="/wishlist" className="p-2 hover:bg-marvvn-gray-50 rounded-full transition-colors relative hidden lg:flex" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
                {wishlistCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-marvvn-red text-white text-xs font-medium rounded-full flex items-center justify-center">
                    {wishlistCount()}
                  </span>
                )}
              </Link>

              <button
                type="button"
                className="p-2 hover:bg-marvvn-gray-50 rounded-full transition-colors relative"
                onClick={toggleCart}
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-marvvn-black text-white text-xs font-medium rounded-full flex items-center justify-center">
                    {totalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mega Menu - Desktop */}
        {navLinks.map((link) => (
          <div
            key={link.label}
            className={cn(
              'absolute left-0 right-0 top-full bg-white border-t border-marvvn-gray-100 shadow-lg transition-all duration-200',
              activeMegaMenu === link.label ? 'opacity-100 visible' : 'opacity-0 invisible'
            )}
            onMouseEnter={() => handleMegaMenuEnter(link.label)}
            onMouseLeave={handleMegaMenuLeave}
          >
            <div className="container py-8">
              <div className="grid grid-cols-4 gap-8">
                {link.megaMenu.columns.map((column) => (
                  <div key={column.title}>
                    <h3 className="font-medium text-sm uppercase tracking-wider mb-4">{column.title}</h3>
                    <ul className="space-y-2">
                      {column.links.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            className="text-sm text-marvvn-gray-600 hover:text-marvvn-black transition-colors"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {link.megaMenu.featuredImage && (
                  <div className="relative group overflow-hidden">
                    <Link href={link.megaMenu.featuredImage.href}>
                      <div className="aspect-[3/4] bg-marvvn-gray-100">
                        <img
                          src={link.megaMenu.featuredImage.src}
                          alt={link.megaMenu.featuredImage.alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <span className="text-sm font-medium uppercase">{link.megaMenu.featuredImage.label}</span>
                        <div className="flex items-center gap-1 text-xs mt-1">
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
      <div className={cn(
        'fixed inset-0 z-[60] bg-white transform transition-transform duration-300 lg:hidden',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )} role="dialog" aria-modal="true" aria-label="Navigation menu">
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

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
