'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Send, MapPin, Phone, Mail } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useSettings } from '@/components/SettingsProvider'

const defaultShopLinks = [
  { label: 'Best Sellers', href: '/collections/best-sellers' },
  { label: 'Special Prices', href: '/collections/special-prices' },
  { label: 'New Arrivals', href: '/collections/new-arrivals' },
  { label: 'Signature', href: '/collections/signature-collection-app' },
]

const defaultTrendingLinks = [
  { label: 'ACOSTA Collection', href: '/collections/acosta-collection-app' },
  { label: 'Anime Collection', href: '/collections/anime-collection-app' },
  { label: 'Oversized T-shirt', href: '/collections/oversized-t-shirt-men' },
  { label: 'Bottoms for Women', href: '/collections/womens-bottoms' },
  { label: 'Bottoms for Men', href: '/collections/mens-bottoms' },
  { label: 'Sweatshirts & Hoodies', href: '/collections/sweatshirts-hoodies' },
]

const infoLinks = [
  { label: 'Terms & Conditions', href: '/pages/terms-and-conditions' },
  { label: 'Stores Near Me', href: '/pages/store-locator' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Track Order', href: '/track-order' },
  { label: 'FAQs', href: '/pages/faq' },
  { label: 'Contact', href: '/pages/get-in-touch' },
  { label: 'Privacy Policy', href: '/policies/privacy-policy' },
  { label: 'Returns and Exchange Policy', href: '/pages/return-exchange-policy' },
]

const exploreLinks = [
  { label: 'Search', href: '/search' },
  { label: 'About Us', href: '/pages/about-us' },
  { label: 'HTML Sitemap', href: '/pages/html-sitemap' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const settings = useSettings()

  const [subscribing, setSubscribing] = useState(false)

  const shopLinks: { label: string; href: string }[] = useMemo(() => {
    try { return JSON.parse(settings.footer_shop_links || '[]') } catch { return defaultShopLinks }
  }, [settings.footer_shop_links])

  const trendingLinks: { label: string; href: string }[] = useMemo(() => {
    try { return JSON.parse(settings.footer_trending_links || '[]') } catch { return defaultTrendingLinks }
  }, [settings.footer_trending_links])

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || subscribing) return
    setSubscribing(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setSubscribed(true)
        setEmail('')
        setTimeout(() => setSubscribed(false), 3000)
      }
    } catch {}
    setSubscribing(false)
  }

  const socialLinks = [
    settings.facebook_url && { icon: Facebook, href: settings.facebook_url, label: 'Facebook' },
    settings.twitter_url && { icon: Twitter, href: settings.twitter_url, label: 'X' },
    settings.instagram_url && { icon: Instagram, href: settings.instagram_url, label: 'Instagram' },
    settings.youtube_url && { icon: Youtube, href: settings.youtube_url, label: 'YouTube' },
  ].filter(Boolean) as { icon: any; href: string; label: string }[]

  return (
    <footer className="bg-marvvn-black text-white">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="container py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-medium mb-1">WE&apos;VE GOT YOU COVERED:</h3>
              <p className="text-sm text-marvvn-gray-400">
                Beyond the Outfit: Be the first to know about new arrivals, sales & exclusive drops.
              </p>
            </div>
            {subscribed ? (
              <div className="px-6 py-3 bg-green-600 text-white text-sm">
                Thanks for subscribing!
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex w-full lg:w-auto">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 lg:w-72 px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                  required
                />
                <button type="submit" disabled={subscribing} className="px-4 py-3 bg-white text-marvvn-black hover:bg-marvvn-gray-100 transition-colors disabled:opacity-50">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-8 lg:py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Shop */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-marvvn-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trending */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Trending</h4>
            <ul className="space-y-2">
              {trendingLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-marvvn-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Info</h4>
            <ul className="space-y-2">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-marvvn-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-marvvn-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3">
              {settings.store_address && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-marvvn-gray-400">{settings.store_address}</span>
                </li>
              )}
              {settings.store_phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <a href={`tel:${settings.store_phone}`} className="text-sm text-marvvn-gray-400 hover:text-white transition-colors">
                    {settings.store_phone}
                  </a>
                </li>
              )}
              {settings.store_email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <a href={`mailto:${settings.store_email}`} className="text-sm text-marvvn-gray-400 hover:text-white transition-colors">
                    {settings.store_email}
                  </a>
                </li>
              )}
            </ul>

            {/* Social */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3 mt-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-marvvn-black transition-all"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-display font-bold">{settings.store_name || 'MARVVN'}</span>
          </div>
          <p className="text-sm text-marvvn-gray-400">&copy; {new Date().getFullYear()} {settings.store_name || 'MARVVN'}</p>
        </div>
      </div>
    </footer>
  )
}
