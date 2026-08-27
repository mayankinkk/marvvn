'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCartStore } from '@/lib/store'
import { useAuthStore } from '@/lib/auth-store'
import { formatPrice } from '@/lib/utils'
import { ChevronRight, CreditCard, Truck, Check, Tag, X } from 'lucide-react'

type Step = 'shipping' | 'payment' | 'review'

export default function CheckoutPage() {
  const { items, totalPrice, finalPrice, promoCode, discount, applyPromoCode, removePromoCode, clearCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [step, setStep] = useState<Step>('shipping')
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState('')

  const [shipping, setShipping] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })

  const [payment, setPayment] = useState({
    method: 'cod' as 'cod' | 'upi' | 'card',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    upiId: '',
  })

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

  const handlePlaceOrder = () => {
    clearCart()
    router.push('/checkout/success')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container py-16 text-center">
          <p className="text-marvnn-gray-500 mb-6">Your cart is empty</p>
          <Link href="/collections/new-arrivals" className="btn-primary">Start Shopping</Link>
        </main>
        <Footer />
      </div>
    )
  }

  const shippingCost = totalPrice() >= 1499 ? 0 : 99
  const total = finalPrice() + shippingCost

  return (
    <div className="min-h-screen bg-marvnn-gray-50">
      <Header />

      <main className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-xs text-marvnn-gray-500 mb-6">
          <Link href="/" className="hover:text-marvnn-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/cart" className="hover:text-marvnn-black">Cart</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-marvnn-black">Checkout</span>
        </nav>

        <h1 className="text-2xl lg:text-3xl font-display font-medium mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {([
            { key: 'shipping', label: 'Shipping', icon: Truck },
            { key: 'payment', label: 'Payment', icon: CreditCard },
            { key: 'review', label: 'Review', icon: Check },
          ] as const).map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s.key ? 'bg-marvnn-black text-white' :
                ['shipping', 'payment', 'review'].indexOf(step) > i ? 'bg-green-600 text-white' :
                'bg-marvnn-gray-200 text-marvnn-gray-500'
              }`}>
                {['shipping', 'payment', 'review'].indexOf(step) > i ? (
                  <Check className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-sm hidden sm:block ${step === s.key ? 'font-medium' : 'text-marvnn-gray-500'}`}>
                {s.label}
              </span>
              {i < 2 && <div className="w-12 h-px bg-marvnn-gray-300 mx-2" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <div className="bg-white border p-6">
                <h2 className="font-medium text-lg mb-6">Shipping Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      value={shipping.firstName}
                      onChange={(e) => setShipping({ ...shipping, firstName: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      value={shipping.lastName}
                      onChange={(e) => setShipping({ ...shipping, lastName: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={shipping.email}
                      onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <input
                      type="text"
                      value={shipping.address}
                      onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <input
                      type="text"
                      value={shipping.state}
                      onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Pincode</label>
                    <input
                      type="text"
                      value={shipping.pincode}
                      onChange={(e) => setShipping({ ...shipping, pincode: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('payment')}
                  className="w-full btn-primary mt-6 py-3"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-white border p-6">
                <h2 className="font-medium text-lg mb-6">Payment Method</h2>
                <div className="space-y-4">
                  {[
                    { value: 'cod', label: 'Cash on Delivery' },
                    { value: 'upi', label: 'UPI Payment' },
                    { value: 'card', label: 'Credit/Debit Card' },
                  ].map((m) => (
                    <label key={m.value} className="flex items-center gap-3 p-3 border cursor-pointer hover:bg-marvnn-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value={m.value}
                        checked={payment.method === m.value}
                        onChange={(e) => setPayment({ ...payment, method: e.target.value as typeof payment.method })}
                        className="accent-marvnn-black"
                      />
                      <span className="text-sm">{m.label}</span>
                    </label>
                  ))}

                  {payment.method === 'card' && (
                    <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-marvnn-gray-50">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={payment.cardNumber}
                          onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Name on Card</label>
                        <input
                          type="text"
                          value={payment.cardName}
                          onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Expiry</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={payment.expiry}
                          onChange={(e) => setPayment({ ...payment, expiry: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          value={payment.cvv}
                          onChange={(e) => setPayment({ ...payment, cvv: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>
                  )}

                  {payment.method === 'upi' && (
                    <div className="p-4 bg-marvnn-gray-50">
                      <label className="block text-sm font-medium mb-1">UPI ID</label>
                      <input
                        type="text"
                        placeholder="yourname@upi"
                        value={payment.upiId}
                        onChange={(e) => setPayment({ ...payment, upiId: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setStep('shipping')} className="btn-secondary flex-1 py-3">
                    Back
                  </button>
                  <button type="button" onClick={() => setStep('review')} className="btn-primary flex-1 py-3">
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="bg-white border p-6">
                <h2 className="font-medium text-lg mb-6">Review Your Order</h2>

                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-marvnn-gray-50">
                    <h3 className="text-sm font-medium mb-2">Shipping Address</h3>
                    <p className="text-sm text-marvnn-gray-600">
                      {shipping.firstName} {shipping.lastName}<br />
                      {shipping.address}<br />
                      {shipping.city}, {shipping.state} {shipping.pincode}<br />
                      {shipping.phone}
                    </p>
                  </div>
                  <div className="p-4 bg-marvnn-gray-50">
                    <h3 className="text-sm font-medium mb-2">Payment Method</h3>
                    <p className="text-sm text-marvnn-gray-600 capitalize">
                      {payment.method === 'cod' ? 'Cash on Delivery' : payment.method === 'upi' ? `UPI: ${payment.upiId}` : `Card ending in ${payment.cardNumber.slice(-4)}`}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-3 items-center">
                      <div className="w-16 h-20 bg-marvnn-gray-100 flex-shrink-0">
                        <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.title}</p>
                        <p className="text-xs text-marvnn-gray-500">{item.size} / {item.color} × {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep('payment')} className="btn-secondary flex-1 py-3">
                    Back
                  </button>
                  <button type="button" onClick={handlePlaceOrder} className="btn-primary flex-1 py-3">
                    Place Order
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border p-6 sticky top-24">
              <h2 className="font-medium text-lg mb-4">Order Summary</h2>

              <div className="space-y-2 text-sm max-h-48 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex justify-between">
                    <span className="text-marvnn-gray-600 truncate mr-2">
                      {item.product.title} × {item.quantity}
                    </span>
                    <span className="flex-shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-marvnn-gray-600">Subtotal</span>
                  <span>{formatPrice(totalPrice())}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount}%)</span>
                    <span>-{formatPrice(totalPrice() - finalPrice())}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-marvnn-gray-600">Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                </div>

                <div className="border-t pt-2 flex justify-between font-medium text-base">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-4 pt-4 border-t">
                {promoCode ? (
                  <div className="flex items-center justify-between px-3 py-2 bg-marvnn-gray-50 border border-marvnn-gray-200">
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{promoCode}</span>
                    </div>
                    <button type="button" onClick={removePromoCode} className="text-marvnn-gray-400 hover:text-marvnn-red">
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
                      className="flex-1 px-3 py-2 text-sm border border-marvnn-gray-300 focus:outline-none focus:border-marvnn-black"
                    />
                    <button type="button" onClick={handleApplyPromo} className="px-3 py-2 text-sm font-medium border border-marvnn-gray-300 hover:border-marvnn-black transition-colors">
                      Apply
                    </button>
                  </div>
                )}
                {promoError && <p className="text-xs text-marvnn-red mt-1">{promoError}</p>}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
