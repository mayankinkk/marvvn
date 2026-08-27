'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Send, MapPin, Phone, Mail } from 'lucide-react'
import { useState } from 'react'

const shopLinks = [
  { label: 'Best Sellers', href: '/collections/best-sellers' },
  { label: 'Special Prices', href: '/collections/special-prices' },
  { label: 'New Arrivals', href: '/collections/new-arrivals' },
  { label: 'Signature', href: '/collections/signature-collection-app' },
]

const trendingLinks = [
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
  { label: 'Blogs', href: '/blogs/bonkers-corner' },
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

const socialLinks = [
  { icon: Facebook, href: 'https://www.facebook.com/TeamBonkerscorner', label: 'Facebook' },
  { icon: Twitter, href: 'https://x.com/BonkersCornerX', label: 'X' },
  { icon: Instagram, href: 'https://www.instagram.com/bonkers.corner/', label: 'Instagram' },
  { icon: Youtube, href: 'https://www.youtube.com/@bonkerscorner', label: 'YouTube' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <footer className="bg-bonkers-black text-white">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="container py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-medium mb-1">WE&apos;VE GOT YOU COVERED:</h3>
              <p className="text-sm text-bonkers-gray-400">
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
                <button type="submit" className="px-4 py-3 bg-white text-bonkers-black hover:bg-bonkers-gray-100 transition-colors">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* App Section */}
      <div className="border-b border-white/10">
        <div className="container py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-medium mb-1">experience the bonkers corner app</h3>
              <p className="text-sm text-bonkers-gray-400">Scan the QR code to download the app</p>
            </div>
            <div className="flex items-center gap-4">
              <img
                src="https://www.bonkerscorner.com/cdn/shop/files/play-store_200x.png?v=1759750741"
                alt="Google Play"
                className="h-10"
              />
              <img
                src="https://www.bonkerscorner.com/cdn/shop/files/app-store_200x.png?v=1759750741"
                alt="App Store"
                className="h-10"
              />
            </div>
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
                  <Link href={link.href} className="text-sm text-bonkers-gray-400 hover:text-white transition-colors">
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
                  <Link href={link.href} className="text-sm text-bonkers-gray-400 hover:text-white transition-colors">
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
                  <Link href={link.href} className="text-sm text-bonkers-gray-400 hover:text-white transition-colors">
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
                  <Link href={link.href} className="text-sm text-bonkers-gray-400 hover:text-white transition-colors">
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
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-bonkers-gray-400">India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:+918655700724" className="text-sm text-bonkers-gray-400 hover:text-white transition-colors">
                  (+91) 8655700724
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:support@bonkerscorner.com" className="text-sm text-bonkers-gray-400 hover:text-white transition-colors">
                  support@bonkerscorner.com
                </a>
              </li>
            </ul>

            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-bonkers-black transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-display font-bold">BONKERS CORNER</span>
          </div>
          <p className="text-sm text-bonkers-gray-400">© 2026 BonkersCorner</p>
        </div>
      </div>
    </footer>
  )
}
