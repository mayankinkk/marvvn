'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, X, ShoppingBag, ArrowRight, ChevronRight, Tag } from 'lucide-react'
import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, finalPrice, clearCart, promoCode, discount, applyPromoCode, removePromoCode } = useCartStore()
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState('')

  const handleApplyPromo = () => {
    setPromoError('')
    if (!promoInput.trim()) return
    const success = applyPromoCode(promoInput)
    if (!success) {
      setPromoError('Invalid promo code')
    } else {
      setPromoInput('')
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-marvvn-gray-500 mb-6">
          <Link href="/" className="hover:text-marvvn-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-marvvn-black">Cart</span>
        </nav>

        <h1 className="text-2xl lg:text-3xl font-display font-medium mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-marvvn-gray-300 mx-auto mb-4" />
            <p className="text-marvvn-gray-500 mb-6">Your cart is currently empty.</p>
            <Link href="/collections/new-arrivals" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2">
              <div className="border-b pb-2 mb-4 hidden md:grid grid-cols-12 gap-4 text-xs font-medium uppercase tracking-wider text-marvvn-gray-500">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <div className="divide-y">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} className="py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-6 flex gap-4">
                      <div className="w-20 h-24 bg-marvvn-gray-50 flex-shrink-0 relative overflow-hidden">
                        <Image
                          src={item.product.images?.[0] || '/placeholder.png'}
                          alt={item.product.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <Link
                          href={`/products/${item.product.handle}`}
                          className="text-sm font-medium hover:text-marvvn-gray-600 transition-colors"
                        >
                          {item.product.title}
                        </Link>
                        <p className="text-xs text-marvvn-gray-500 mt-1">
                          {item.size} / {item.color}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id, item.size, item.color)}
                          className="text-xs text-marvvn-gray-400 hover:text-marvvn-red mt-2 flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2 text-center">
                      <span className="text-sm">{formatPrice(item.product.price)}</span>
                    </div>
                    <div className="md:col-span-2 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border hover:bg-marvvn-gray-50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border hover:bg-marvvn-gray-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="md:col-span-2 text-right">
                      <span className="text-sm font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-6">
                <Link href="/collections/new-arrivals" className="btn-secondary flex items-center gap-2">
                  Continue Shopping
                </Link>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-sm text-marvvn-gray-400 hover:text-marvvn-red transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="border p-6 sticky top-24">
                <h2 className="font-medium text-lg mb-6">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-marvvn-gray-600">Subtotal ({totalItems()} items)</span>
                    <span>{formatPrice(totalPrice())}</span>
                  </div>

                  {/* Promo Code */}
                  <div className="pt-2">
                    {promoCode ? (
                      <div className="flex items-center justify-between px-3 py-2 bg-marvvn-gray-50 border border-marvvn-gray-200">
                        <div className="flex items-center gap-2 text-sm">
                          <Tag className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{promoCode}</span>
                          <span className="text-green-600 text-xs">(-{discount}%)</span>
                        </div>
                        <button type="button" onClick={removePromoCode} className="text-marvvn-gray-400 hover:text-marvvn-red">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Promo code"
                          value={promoInput}
                          onChange={(e) => { setPromoInput(e.target.value); setPromoError('') }}
                          className="flex-1 px-3 py-2 text-sm border border-marvvn-gray-300 focus:outline-none focus:border-marvvn-black"
                        />
                        <button type="button" onClick={handleApplyPromo} className="px-3 py-2 text-sm font-medium border border-marvvn-gray-300 hover:border-marvvn-black transition-colors">
                          Apply
                        </button>
                      </div>
                    )}
                    {promoError && <p className="text-xs text-marvvn-red mt-1">{promoError}</p>}
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discount}%)</span>
                      <span>-{formatPrice(totalPrice() - finalPrice())}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-marvvn-gray-600">Shipping</span>
                    <span className="text-marvvn-gray-400">Calculated at checkout</span>
                  </div>
                </div>
                <div className="border-t mt-4 pt-4 flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(finalPrice())}</span>
                </div>
                <Link
                  href="/checkout"
                  className="w-full btn-primary mt-6 py-4 flex items-center justify-center gap-2"
                >
                  Checkout <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-xs text-marvvn-gray-400 mt-4 text-center">
                  Try code SHARKTANK10 for 10% off!
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
