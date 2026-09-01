'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { CheckCircle, Package, Home, ShoppingBag, Plus } from 'lucide-react'
import { Suspense, useState, useEffect } from 'react'

interface UpsellProduct {
  id: string
  title: string
  price: number
  handle: string
  images: string[]
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') || 'N/A'
  const { addItem } = useCartStore()
  const [upsellProducts, setUpsellProducts] = useState<UpsellProduct[]>([])
  const [addedId, setAddedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/products?limit=4&random=true')
      .then(res => res.json())
      .then(data => setUpsellProducts(data.products || []))
      .catch(() => {})
  }, [])

  const handleAddToCart = (product: UpsellProduct) => {
    addItem(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        handle: product.handle,
        images: product.images,
        description: '',
        category: 'men',
        collection: [],
        tags: [],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [],
      } as any,
      'M',
      '',
      1
    )
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 2000)
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-16 lg:py-24">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-12">
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
                A confirmation has been sent to your email and WhatsApp. You can track your order from your account.
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

          {/* Post-Purchase Upsell */}
          {upsellProducts.length > 0 && (
            <div className="border border-marvvn-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-5 h-5 text-marvvn-gray-400" />
                <h2 className="text-lg font-semibold">Complete Your Look</h2>
              </div>
              <p className="text-sm text-marvvn-gray-500 mb-6">Add these to your order before it ships</p>
              
              <div className="grid grid-cols-2 gap-4">
                {upsellProducts.map((product) => (
                  <div key={product.id} className="group">
                    <Link href={`/products/${product.handle}`} className="block aspect-square bg-marvvn-gray-50 relative overflow-hidden mb-3">
                      <Image
                        src={product.images?.[0] || '/placeholder.png'}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 200px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    <Link href={`/products/${product.handle}`} className="text-sm font-medium block truncate hover:underline">
                      {product.title}
                    </Link>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-marvvn-gray-600">{formatPrice(product.price)}</p>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={addedId === product.id}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
                          addedId === product.id
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'border-marvvn-gray-300 hover:border-marvvn-black hover:bg-marvvn-black hover:text-white'
                        }`}
                      >
                        {addedId === product.id ? (
                          'Added'
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/collections/new-arrivals"
                className="block text-center mt-6 text-sm font-medium text-marvvn-gray-500 hover:text-marvvn-black underline"
              >
                View All New Arrivals
              </Link>
            </div>
          )}
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
