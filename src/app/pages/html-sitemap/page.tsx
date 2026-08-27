'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronRight } from 'lucide-react'

const siteLinks = [
  { title: 'Shop', links: [
    { label: 'New Arrivals', href: '/collections/new-arrivals' },
    { label: 'Best Sellers', href: '/collections/best-sellers' },
    { label: 'Women', href: '/collections/women' },
    { label: 'Men', href: '/collections/men' },
    { label: 'Accessories', href: '/collections/accessories' },
    { label: 'Oversized T-Shirts', href: '/collections/oversized-t-shirts' },
    { label: 'Bottoms', href: '/collections/bottoms' },
    { label: 'Jackets', href: '/collections/jackets' },
    { label: 'Caps', href: '/collections/caps' },
  ]},
  { title: 'Information', links: [
    { label: 'About Us', href: '/pages/about-us' },
    { label: 'Contact Us', href: '/pages/get-in-touch' },
    { label: 'Store Locator', href: '/pages/store-locator' },
    { label: 'FAQ', href: '/pages/faq' },
    { label: 'Blogs', href: '/blogs/bonkers-corner' },
  ]},
  { title: 'Policies', links: [
    { label: 'Privacy Policy', href: '/policies/privacy-policy' },
    { label: 'Terms & Conditions', href: '/pages/terms-and-conditions' },
    { label: 'Return & Exchange Policy', href: '/pages/return-exchange-policy' },
  ]},
  { title: 'Account', links: [
    { label: 'Login', href: '/account/login' },
    { label: 'Register', href: '/account/register' },
    { label: 'My Orders', href: '/account/orders' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'Cart', href: '/cart' },
  ]},
]

export default function SitemapPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-xs text-bonkers-gray-500 mb-6">
          <Link href="/" className="hover:text-bonkers-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-bonkers-black">Sitemap</span>
        </nav>

        <h1 className="text-2xl lg:text-3xl font-display font-medium mb-8">HTML Sitemap</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {siteLinks.map((section) => (
            <div key={section.title}>
              <h2 className="font-medium text-sm uppercase tracking-wider mb-4">{section.title}</h2>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-bonkers-gray-600 hover:text-bonkers-black transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
