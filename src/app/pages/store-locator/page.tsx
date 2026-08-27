'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronRight, MapPin, Clock, Phone } from 'lucide-react'

const stores = [
  {
    name: 'Bonkers Corner - Mumbai Flagship',
    address: 'Linking Road, Bandra West, Mumbai, Maharashtra 400050',
    phone: '+91 8655700724',
    hours: 'Mon-Sat: 10AM - 9PM, Sun: 11AM - 8PM',
  },
  {
    name: 'Bonkers Corner - Delhi',
    address: 'MG Road, Connaught Place, New Delhi 110001',
    phone: '+91 8655700724',
    hours: 'Mon-Sat: 10AM - 9PM, Sun: 11AM - 8PM',
  },
  {
    name: 'Bonkers Corner - Bangalore',
    address: 'Church Street, Bangalore, Karnataka 560001',
    phone: '+91 8655700724',
    hours: 'Mon-Sat: 10AM - 9PM, Sun: 11AM - 8PM',
  },
]

export default function StoreLocatorPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-xs text-bonkers-gray-500 mb-6">
          <Link href="/" className="hover:text-bonkers-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-bonkers-black">Store Locator</span>
        </nav>

        <h1 className="text-2xl lg:text-3xl font-display font-medium mb-2">Find a Store</h1>
        <p className="text-sm text-bonkers-gray-500 mb-8">
          Visit us in person and experience the Bonkers Corner collection
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store, i) => (
            <div key={i} className="border p-6 hover:shadow-lg transition-shadow">
              <h2 className="font-medium mb-4">{store.name}</h2>
              <div className="space-y-3 text-sm text-bonkers-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-bonkers-gray-400" />
                  <span>{store.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0 text-bonkers-gray-400" />
                  <a href={`tel:${store.phone.replace(/\s/g, '')}`} className="hover:text-bonkers-black transition-colors">
                    {store.phone}
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-bonkers-gray-400" />
                  <span>{store.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-bonkers-gray-50 p-8 text-center">
          <h2 className="text-lg font-medium mb-2">Can&apos;t find a store near you?</h2>
          <p className="text-sm text-bonkers-gray-500 mb-4">
            Shop online and get free shipping on orders above ₹1,499
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
