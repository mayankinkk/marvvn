'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { X, Minus, Plus, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function CartDrawer() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, totalItems, totalPrice, finalPrice, promoCode, discount, applyPromoCode, removePromoCode } = useCartStore()
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
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[70] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[80] transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <h2 className="font-medium">Cart ({totalItems()})</h2>
            </div>
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              className="p-2 hover:bg-marvvn-gray-50 rounded-full transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-12 h-12 text-marvvn-gray-300 mb-4" />
                <p className="text-marvvn-gray-500 mb-4">Your cart is currently empty.</p>
                <Link
                  href="/collections/new-arrivals"
                  className="btn-primary"
                  onClick={() => setCartOpen(false)}
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4 pb-4 border-b">
                    <div className="w-20 h-24 bg-marvvn-gray-100 flex-shrink-0 relative overflow-hidden">
                      <Image
                        src={item.product.images?.[0] || '/placeholder.png'}
                        alt={item.product.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate">{item.product.title}</h3>
                      <p className="text-xs text-marvvn-gray-500 mt-0.5">
                        {item.size} / {item.color}
                      </p>
                      <p className="text-sm font-medium mt-1">{formatPrice(item.product.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border rounded hover:bg-marvvn-gray-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border rounded hover:bg-marvvn-gray-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.product.id, item.size, item.color)}
                      className="p-1 hover:bg-marvvn-gray-50 rounded transition-colors self-start"
                    >
                      <X className="w-4 h-4 text-marvvn-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-3">
              {/* Promo Code */}
              <div>
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
                    <button type="button" onClick={handleApplyPromo} className="px-4 py-2 text-sm font-medium border border-marvvn-gray-300 hover:border-marvvn-black transition-colors">
                      Apply
                    </button>
                  </div>
                )}
                {promoError && <p className="text-xs text-marvvn-red mt-1">{promoError}</p>}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-marvvn-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(totalPrice())}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <span className="text-sm">Discount ({discount}%)</span>
                  <span className="text-sm">-{formatPrice(totalPrice() - finalPrice())}</span>
                </div>
              )}
              <p className="text-xs text-marvvn-gray-500">
                Shipping, taxes calculated at checkout.
              </p>
              <Link
                href="/checkout"
                className="w-full btn-primary flex items-center justify-center gap-2"
                onClick={() => setCartOpen(false)}
              >
                Checkout <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/cart"
                className="block w-full btn-secondary text-center"
                onClick={() => setCartOpen(false)}
              >
                View Cart
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
