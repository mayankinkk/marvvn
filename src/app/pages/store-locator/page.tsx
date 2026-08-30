import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Store Locator | MARVVN',
  description: 'Find MARVVN stores near you or shop online with free shipping.',
}

export default function StoreLocatorPage() {
  const freeShippingThreshold = 999

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

        <div className="bg-marvvn-gray-50 p-8 text-center">
          <h2 className="text-lg font-medium mb-2">Can&apos;t find a store near you?</h2>
          <p className="text-sm text-marvvn-gray-500 mb-4">
            Shop online and get free shipping on orders above ₹{freeShippingThreshold}
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
