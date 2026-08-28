import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Search } from 'lucide-react'

export const metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-16 lg:py-24 text-center">
        <h1 className="text-6xl lg:text-8xl font-display font-bold text-marvvn-gray-200 mb-4">404</h1>
        <h2 className="text-xl lg:text-2xl font-display font-medium mb-4">Page Not Found</h2>
        <p className="text-marvvn-gray-500 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
          <Link href="/search" className="btn-secondary flex items-center gap-2">
            <Search className="w-4 h-4" /> Search Products
          </Link>
        </div>

        <div className="max-w-md mx-auto">
          <p className="text-sm text-marvvn-gray-400 uppercase tracking-wider mb-4">Popular Collections</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/collections/new-arrivals" className="px-4 py-2 text-sm border border-marvvn-gray-300 hover:border-marvvn-black transition-colors">
              New Arrivals
            </Link>
            <Link href="/collections/best-sellers" className="px-4 py-2 text-sm border border-marvvn-gray-300 hover:border-marvvn-black transition-colors">
              Bestsellers
            </Link>
            <Link href="/collections/women" className="px-4 py-2 text-sm border border-marvvn-gray-300 hover:border-marvvn-black transition-colors">
              Women
            </Link>
            <Link href="/collections/men" className="px-4 py-2 text-sm border border-marvvn-gray-300 hover:border-marvvn-black transition-colors">
              Men
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
