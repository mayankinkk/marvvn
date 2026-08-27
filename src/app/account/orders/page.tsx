'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuthStore } from '@/lib/auth-store'
import { ChevronRight, Package } from 'lucide-react'

export default function OrdersPage() {
  const { isAuthenticated, loading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/account/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading || !isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-xs text-marvvn-gray-500 mb-6">
          <Link href="/" className="hover:text-marvvn-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/account" className="hover:text-marvvn-black">Account</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-marvvn-black">Orders</span>
        </nav>

        <h1 className="text-2xl lg:text-3xl font-display font-medium mb-8">My Orders</h1>

        <div className="text-center py-16">
          <Package className="w-16 h-16 text-marvvn-gray-300 mx-auto mb-4" />
          <p className="text-marvvn-gray-500 mb-2">No orders yet</p>
          <p className="text-sm text-marvvn-gray-400 mb-6">Start shopping to see your orders here</p>
          <Link href="/collections/new-arrivals" className="btn-primary">
            Shop Now
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
