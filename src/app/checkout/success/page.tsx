'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CheckCircle, Package, Home } from 'lucide-react'
import { Suspense } from 'react'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') || 'N/A'

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-16 lg:py-24">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-2xl lg:text-3xl font-display font-medium mb-4">Order Confirmed!</h1>
          <p className="text-marvvn-gray-500 mb-2">Thank you for your purchase</p>
          <p className="text-sm text-marvvn-gray-400 mb-8">
            Order ID: <span className="font-mono font-medium text-marvvn-black">{orderId}</span>
          </p>

          <div className="border p-6 mb-8 text-left">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-5 h-5 text-marvvn-gray-400" />
              <div>
                <p className="text-sm font-medium">Estimated Delivery</p>
                <p className="text-sm text-marvvn-gray-500">3-5 business days</p>
              </div>
            </div>
            <p className="text-sm text-marvvn-gray-500">
              A confirmation has been sent to your email. You can track your order from your account.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/account/orders" className="btn-secondary flex-1 py-3">
              View Orders
            </Link>
            <Link href="/" className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
              <Home className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
