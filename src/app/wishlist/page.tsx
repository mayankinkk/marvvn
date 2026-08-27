'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { useWishlistStore } from '@/lib/wishlist-store'
import { ChevronRight, Heart } from 'lucide-react'

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlistStore()

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-xs text-bonkers-gray-500 mb-6">
          <Link href="/" className="hover:text-bonkers-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-bonkers-black">Wishlist</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl lg:text-3xl font-display font-medium">Wishlist ({items.length})</h1>
          {items.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-sm text-bonkers-gray-400 hover:text-bonkers-red transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-bonkers-gray-300 mx-auto mb-4" />
            <p className="text-bonkers-gray-500 mb-6">Your wishlist is empty</p>
            <Link href="/collections/new-arrivals" className="btn-primary">
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
