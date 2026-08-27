'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuthStore } from '@/lib/auth-store'
import { ChevronRight, User, Package, Heart, LogOut } from 'lucide-react'

export default function AccountPage() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()

  if (!isAuthenticated) {
    router.push('/account/login')
    return null
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-xs text-bonkers-gray-500 mb-6">
          <Link href="/" className="hover:text-bonkers-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-bonkers-black">My Account</span>
        </nav>

        <h1 className="text-2xl lg:text-3xl font-display font-medium mb-8">My Account</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-2">
            <div className="border p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-bonkers-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-bonkers-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">{user?.name}</p>
                  <p className="text-xs text-bonkers-gray-500">{user?.email}</p>
                </div>
              </div>
              <nav className="space-y-1">
                <Link href="/account" className="block px-3 py-2 text-sm bg-bonkers-gray-50 font-medium">
                  Dashboard
                </Link>
                <Link href="/account/orders" className="block px-3 py-2 text-sm hover:bg-bonkers-gray-50 transition-colors">
                  Orders
                </Link>
                <Link href="/wishlist" className="block px-3 py-2 text-sm hover:bg-bonkers-gray-50 transition-colors">
                  Wishlist
                </Link>
                <button
                  onClick={() => { logout(); router.push('/') }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-bonkers-red hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-2 space-y-6">
            <div className="border p-6">
              <h2 className="font-medium mb-4">Account Details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-bonkers-gray-500">Name:</span>
                  <span className="ml-2">{user?.name}</span>
                </div>
                <div>
                  <span className="text-bonkers-gray-500">Email:</span>
                  <span className="ml-2">{user?.email}</span>
                </div>
                {user?.phone && (
                  <div>
                    <span className="text-bonkers-gray-500">Phone:</span>
                    <span className="ml-2">{user.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border p-6">
              <h2 className="font-medium mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/account/orders" className="border p-4 hover:bg-bonkers-gray-50 transition-colors text-center">
                  <Package className="w-6 h-6 mx-auto mb-2 text-bonkers-gray-400" />
                  <span className="text-sm font-medium">My Orders</span>
                </Link>
                <Link href="/wishlist" className="border p-4 hover:bg-bonkers-gray-50 transition-colors text-center">
                  <Heart className="w-6 h-6 mx-auto mb-2 text-bonkers-gray-400" />
                  <span className="text-sm font-medium">Wishlist</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
