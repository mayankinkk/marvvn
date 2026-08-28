'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronRight, MapPin, Clock, Phone } from 'lucide-react'
import { useSettings } from '@/components/SettingsProvider'
import { useCurrency } from '@/lib/hooks/useCurrency'

const defaultStores = [
  {
    name: 'MARVVN - Mumbai Flagship',
    address: 'Linking Road, Bandra West, Mumbai, Maharashtra 400050',
    hours: 'Mon-Sat: 10AM - 9PM, Sun: 11AM - 8PM',
  },
  {
    name: 'MARVVN - Delhi',
    address: 'MG Road, Connaught Place, New Delhi 110001',
    hours: 'Mon-Sat: 10AM - 9PM, Sun: 11AM - 8PM',
  },
  {
    name: 'MARVVN - Bangalore',
    address: 'Church Street, Bangalore, Karnataka 560001',
    hours: 'Mon-Sat: 10AM - 9PM, Sun: 11AM - 8PM',
  },
]

export default function StoreLocatorPage() {
  const settings = useSettings()
  const { symbol } = useCurrency()
  const storePhone = settings.store_phone || ''

  const stores = defaultStores.map(s => ({ ...s, phone: storePhone }))

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-xs text-marvvn-gray-500 mb-6">
          <Link href="/" className="hover:text-marvvn-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-marvvn-black">Store Locator</span>
        </nav>

        <h1 className="text-2xl lg:text-3xl font-display font-medium mb-2">Find a Store</h1>
        <p className="text-sm text-marvvn-gray-500 mb-8">
          Visit us in person and experience the MARVVN collection
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store, i) => (
            <div key={i} className="border p-6 hover:shadow-lg transition-shadow">
              <h2 className="font-medium mb-4">{store.name}</h2>
              <div className="space-y-3 text-sm text-marvvn-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-marvvn-gray-400" />
                  <span>{store.address}</span>
                </div>
                {store.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 flex-shrink-0 text-marvvn-gray-400" />
                    <a href={`tel:${store.phone.replace(/\s/g, '')}`} className="hover:text-marvvn-black transition-colors">
                      {store.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-marvvn-gray-400" />
                  <span>{store.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-marvvn-gray-50 p-8 text-center">
          <h2 className="text-lg font-medium mb-2">Can&apos;t find a store near you?</h2>
          <p className="text-sm text-marvvn-gray-500 mb-4">
            Shop online and get free shipping on orders above {symbol}{settings.free_shipping_threshold || '999'}
          </p>
          <Link href="/collections/new-arrivals" className="btn-primary">
            Shop Online
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
