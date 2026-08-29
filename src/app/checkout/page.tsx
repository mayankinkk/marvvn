'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCartStore } from '@/lib/store'
import { useAuthStore } from '@/lib/auth-store'
import { useSettings } from '@/components/SettingsProvider'
import { formatPrice } from '@/lib/utils'
import { ChevronDown, ChevronUp, Check, Truck, ShieldCheck, RotateCcw, Tag, X, Loader2, CreditCard, Wallet, Banknote } from 'lucide-react'

type Step = 'contact' | 'shipping' | 'payment'

export default function CheckoutPage() {
  const { items, totalPrice, finalPrice, promoCode, discount, applyPromoCode, removePromoCode, clearCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const settings = useSettings()
  const router = useRouter()

  const freeShippingThreshold = Number(settings.free_shipping_threshold) || 999
  const shippingFee = Number(settings.shipping_fee) || 65

  const [step, setStep] = useState<Step>('contact')
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState('')
  const [isPlacing, setIsPlacing] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [v, setV] = useState<Record<string, string>>({})
  const [openSection, setOpenSection] = useState<string | null>('contact')
  const [showItems, setShowItems] = useState(false)

  const [contact, setContact] = useState({
    email: user?.email || '',
    phone: '',
  })

  const [shipping, setShipping] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
  })

  const [payment, setPayment] = useState({
    method: 'upi' as 'cod' | 'upi' | 'card',
  })

  useEffect(() => {
    if (payment.method !== 'cod' && !(window as any).Razorpay) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [payment.method])

  // Track cart abandonment
  useEffect(() => {
    if (items.length === 0) return
    const email = contact.email || user?.email
    if (!email) return
    const timer = setTimeout(() => {
      fetch('/api/cart-abandonment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          items: items.map(i => ({ title: i.product.title, quantity: i.quantity, price: i.product.price, handle: i.product.handle })),
          total: totalPrice(),
        }),
      }).catch(() => {})
    }, 60 * 60 * 1000)
    return () => clearTimeout(timer)
  }, [items, totalPrice, contact.email, user?.email])

  const shippingCost = totalPrice() >= freeShippingThreshold ? 0 : shippingFee
  const total = finalPrice() + shippingCost

  const validate = (fields: Record<string, any>): boolean => {
    const errors: Record<string, string> = {}
    Object.entries(fields).forEach(([key, val]) => {
      if (!val || (typeof val === 'string' && !val.trim())) errors[key] = 'This field is required'
    })
    if (contact.email && !contact.email.includes('@')) errors.email = 'Enter a valid email'
    if (contact.phone && contact.phone.length < 10) errors.phone = 'Enter a valid phone number'
    if (shipping.pincode && shipping.pincode.length < 6) errors.pincode = 'Enter a valid pincode'
    setV(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (step === 'contact') {
      if (validate({ email: contact.email, phone: contact.phone })) {
        setStep('shipping')
        setOpenSection('shipping')
      }
    } else if (step === 'shipping') {
      if (validate({
        firstName: shipping.firstName,
        lastName: shipping.lastName,
        address: shipping.address,
        city: shipping.city,
        state: shipping.state,
        pincode: shipping.pincode,
      })) {
        setStep('payment')
        setOpenSection('payment')
      }
    }
  }

  const handlePlaceOrder = async () => {
    setIsPlacing(true)
    setOrderError('')

    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
          promoCode: promoCode || null,
          shippingAddress: {
            firstName: shipping.firstName,
            lastName: shipping.lastName,
            email: contact.email,
            phone: contact.phone,
            address: shipping.address,
            apartment: shipping.apartment,
            city: shipping.city,
            state: shipping.state,
            pincode: shipping.pincode,
          },
          paymentMethod: payment.method,
        }),
      })

      if (!orderRes.ok) {
        const data = await orderRes.json()
        throw new Error(data.error || 'Failed to place order')
      }

      const orderData = await orderRes.json()

      if (payment.method !== 'cod') {
        const payRes = await fetch('/api/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total, orderId: orderData.order.id }),
        })

        if (!payRes.ok) throw new Error('Payment initialization failed')
        const payData = await payRes.json()

        const options = {
          key: payData.keyId,
          amount: payData.amount,
          currency: payData.currency,
          name: 'MARVVN',
          order_id: payData.orderId,
          handler: async (response: any) => {
            await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, orderId: orderData.order.id }),
            })
            clearCart()
            router.push(`/checkout/success?orderId=${orderData.order.id}`)
          },
          prefill: {
            name: `${shipping.firstName} ${shipping.lastName}`,
            email: contact.email,
            contact: contact.phone,
          },
          theme: { color: '#000000' },
          modal: {
            ondismiss: () => {
              setIsPlacing(false)
              setOrderError('Payment was cancelled. Your order is saved — you can complete payment from your orders.')
            },
          },
        }

        const razorpay = new (window as any).Razorpay(options)
        razorpay.on('payment.failed', () => {
          setIsPlacing(false)
          setOrderError('Payment failed. Please try again.')
        })
        razorpay.open()
        return
      }

      clearCart()
      router.push(`/checkout/success?orderId=${orderData.order.id}`)
    } catch (err: any) {
      setOrderError(err.message || 'Something went wrong.')
      setIsPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container py-16 text-center">
          <p className="text-marvvn-gray-500 mb-6">Your cart is empty</p>
          <Link href="/collections/new-arrivals" className="btn-primary">Start Shopping</Link>
        </main>
        <Footer />
      </div>
    )
  }

  const stepIndex = { contact: 0, shipping: 1, payment: 2 }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Progress Bar */}
      <div className="border-b border-marvvn-gray-100">
        <div className="container py-4">
          <div className="flex items-center justify-between max-w-xl mx-auto">
            {(['contact', 'shipping', 'payment'] as const).map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <button
                  type="button"
                  onClick={() => {
                    if (i <= stepIndex[step]) {
                      setStep(s)
                      setOpenSection(s)
                    }
                  }}
                  className={`flex items-center gap-2 cursor-pointer ${
                    i <= stepIndex[step] ? 'text-marvvn-black' : 'text-marvvn-gray-300'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    i < stepIndex[step] ? 'bg-marvvn-black text-white' :
                    i === stepIndex[step] ? 'bg-marvvn-black text-white' :
                    'bg-marvvn-gray-100 text-marvvn-gray-400'
                  }`}>
                    {i < stepIndex[step] ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </span>
                  <span className="text-xs font-medium hidden sm:block">{s === 'contact' ? 'Contact' : s === 'shipping' ? 'Shipping' : 'Payment'}</span>
                </button>
                {i < 2 && <div className={`flex-1 h-px mx-3 ${i < stepIndex[step] ? 'bg-marvvn-black' : 'bg-marvvn-gray-100'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="container py-6 lg:py-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left — Form */}
          <div className="lg:col-span-7">
            <h1 className="text-xl lg:text-2xl font-semibold text-marvvn-black mb-6">Checkout</h1>

            {orderError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-sm text-red-700">{orderError}</div>
            )}

            {/* Contact Section */}
            <div className="border border-marvvn-gray-200 mb-3">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === 'contact' ? null : 'contact')}
                className="w-full flex items-center justify-between p-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    stepIndex[step] > 0 ? 'bg-marvvn-black text-white' : 'border border-marvvn-gray-300 text-marvvn-gray-500'
                  }`}>
                    {stepIndex[step] > 0 ? <Check className="w-3 h-3" /> : '1'}
                  </span>
                  <span className="text-sm font-semibold text-marvvn-black">Contact information</span>
                </div>
                {openSection === 'contact' ? <ChevronUp className="w-4 h-4 text-marvvn-gray-400" /> : <ChevronDown className="w-4 h-4 text-marvvn-gray-400" />}
              </button>
              {openSection === 'contact' && (
                <div className="px-4 pb-4 pt-0 space-y-3">
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      className={`w-full px-3 py-2.5 text-sm border ${v.email ? 'border-red-500' : 'border-marvvn-gray-300'} focus:border-marvvn-black focus:outline-none transition-colors`}
                    />
                    {v.email && <p className="text-xs text-red-500 mt-1">{v.email}</p>}
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      className={`w-full px-3 py-2.5 text-sm border ${v.phone ? 'border-red-500' : 'border-marvvn-gray-300'} focus:border-marvvn-black focus:outline-none transition-colors`}
                    />
                    {v.phone && <p className="text-xs text-red-500 mt-1">{v.phone}</p>}
                  </div>
                  <button type="button" onClick={handleNext} className="w-full bg-marvvn-black text-white py-3 text-sm font-semibold hover:bg-marvvn-gray-900 transition-colors cursor-pointer">
                    Continue to Shipping
                  </button>
                </div>
              )}
            </div>

            {/* Shipping Section */}
            <div className="border border-marvvn-gray-200 mb-3">
              <button
                type="button"
                onClick={() => { if (stepIndex[step] >= 1) setOpenSection(openSection === 'shipping' ? null : 'shipping') }}
                className={`w-full flex items-center justify-between p-4 ${stepIndex[step] >= 1 ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    stepIndex[step] > 1 ? 'bg-marvvn-black text-white' : stepIndex[step] === 1 ? 'bg-marvvn-black text-white' : 'border border-marvvn-gray-300 text-marvvn-gray-500'
                  }`}>
                    {stepIndex[step] > 1 ? <Check className="w-3 h-3" /> : '2'}
                  </span>
                  <span className="text-sm font-semibold text-marvvn-black">Shipping address</span>
                </div>
                {openSection === 'shipping' ? <ChevronUp className="w-4 h-4 text-marvvn-gray-400" /> : <ChevronDown className="w-4 h-4 text-marvvn-gray-400" />}
              </button>
              {openSection === 'shipping' && (
                <div className="px-4 pb-4 pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="First name"
                      value={shipping.firstName}
                      onChange={(e) => setShipping({ ...shipping, firstName: e.target.value })}
                      className={`px-3 py-2.5 text-sm border ${v.firstName ? 'border-red-500' : 'border-marvvn-gray-300'} focus:border-marvvn-black focus:outline-none`}
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={shipping.lastName}
                      onChange={(e) => setShipping({ ...shipping, lastName: e.target.value })}
                      className={`px-3 py-2.5 text-sm border ${v.lastName ? 'border-red-500' : 'border-marvvn-gray-300'} focus:border-marvvn-black focus:outline-none`}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Address"
                    value={shipping.address}
                    onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                    className={`w-full px-3 py-2.5 text-sm border ${v.address ? 'border-red-500' : 'border-marvvn-gray-300'} focus:border-marvvn-black focus:outline-none`}
                  />
                  <input
                    type="text"
                    placeholder="Apartment, suite, etc. (optional)"
                    value={shipping.apartment}
                    onChange={(e) => setShipping({ ...shipping, apartment: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-marvvn-gray-300 focus:border-marvvn-black focus:outline-none"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      className={`col-span-1 px-3 py-2.5 text-sm border ${v.city ? 'border-red-500' : 'border-marvvn-gray-300'} focus:border-marvvn-black focus:outline-none`}
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={shipping.state}
                      onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                      className={`col-span-1 px-3 py-2.5 text-sm border ${v.state ? 'border-red-500' : 'border-marvvn-gray-300'} focus:border-marvvn-black focus:outline-none`}
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={shipping.pincode}
                      onChange={(e) => setShipping({ ...shipping, pincode: e.target.value })}
                      className={`col-span-1 px-3 py-2.5 text-sm border ${v.pincode ? 'border-red-500' : 'border-marvvn-gray-300'} focus:border-marvvn-black focus:outline-none`}
                    />
                  </div>
                  {(v.firstName || v.lastName || v.address || v.city || v.state || v.pincode) && (
                    <p className="text-xs text-red-500">Please fill in all required fields</p>
                  )}
                  <button type="button" onClick={handleNext} className="w-full bg-marvvn-black text-white py-3 text-sm font-semibold hover:bg-marvvn-gray-900 transition-colors cursor-pointer">
                    Continue to Payment
                  </button>
                </div>
              )}
            </div>

            {/* Payment Section */}
            <div className="border border-marvvn-gray-200 mb-3">
              <button
                type="button"
                onClick={() => { if (stepIndex[step] >= 2) setOpenSection(openSection === 'payment' ? null : 'payment') }}
                className={`w-full flex items-center justify-between p-4 ${stepIndex[step] >= 2 ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    stepIndex[step] >= 2 ? 'bg-marvvn-black text-white' : 'border border-marvvn-gray-300 text-marvvn-gray-500'
                  }`}>
                    3
                  </span>
                  <span className="text-sm font-semibold text-marvvn-black">Payment</span>
                </div>
                {openSection === 'payment' ? <ChevronUp className="w-4 h-4 text-marvvn-gray-400" /> : <ChevronDown className="w-4 h-4 text-marvvn-gray-400" />}
              </button>
              {openSection === 'payment' && (
                <div className="px-4 pb-4 pt-0">
                  <div className="space-y-2">
                    {[
                      { value: 'upi', label: 'UPI / Google Pay / PhonePe', icon: Wallet, desc: 'Pay instantly via UPI' },
                      { value: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
                      { value: 'cod', label: 'Cash on Delivery', icon: Banknote, desc: 'Pay when you receive' },
                    ].map((m) => (
                      <label
                        key={m.value}
                        className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                          payment.method === m.value ? 'border-marvvn-black bg-marvvn-gray-50' : 'border-marvvn-gray-200 hover:border-marvvn-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={m.value}
                          checked={payment.method === m.value}
                          onChange={(e) => setPayment({ ...payment, method: e.target.value as typeof payment.method })}
                          className="accent-marvvn-black"
                        />
                        <m.icon className="w-5 h-5 text-marvvn-gray-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{m.label}</p>
                          <p className="text-[11px] text-marvvn-gray-400">{m.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isPlacing}
                    className="w-full mt-4 bg-marvvn-black text-white py-3.5 text-sm font-semibold hover:bg-marvvn-gray-900 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isPlacing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      `Place Order — ${formatPrice(total)}`
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right — Order Summary */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              {/* Items toggle */}
              <div className="lg:hidden border border-marvvn-gray-200 mb-3">
                <button
                  type="button"
                  onClick={() => setShowItems(!showItems)}
                  className="w-full flex items-center justify-between p-4 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-marvvn-black">Order summary</span>
                    <span className="text-xs text-marvvn-gray-400">({items.length} item{items.length > 1 ? 's' : ''})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-marvvn-black">{formatPrice(total)}</span>
                    {showItems ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {showItems && (
                  <div className="px-4 pb-4 space-y-3">
                    {items.map((item) => (
                      <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-3">
                        <div className="w-14 h-16 bg-marvvn-gray-50 relative flex-shrink-0">
                          <Image src={item.product.images?.[0] || '/placeholder.png'} alt={item.product.title} fill sizes="56px" className="object-cover" />
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-marvvn-gray-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">{item.quantity}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{item.product.title}</p>
                          <p className="text-[11px] text-marvvn-gray-400">{item.size}{item.color ? ` / ${item.color}` : ''}</p>
                        </div>
                        <span className="text-xs font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop Summary */}
              <div className="hidden lg:block border border-marvvn-gray-200 p-5">
                <h2 className="text-sm font-semibold text-marvvn-black mb-4">Order summary</h2>

                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-3">
                      <div className="w-14 h-16 bg-marvvn-gray-50 relative flex-shrink-0">
                        <Image src={item.product.images?.[0] || '/placeholder.png'} alt={item.product.title} fill sizes="56px" className="object-cover" />
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-marvvn-gray-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">{item.quantity}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.product.title}</p>
                        <p className="text-[11px] text-marvvn-gray-400">{item.size}{item.color ? ` / ${item.color}` : ''}</p>
                      </div>
                      <span className="text-xs font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <div className="border-t border-marvvn-gray-100 pt-3 mb-3">
                  {promoCode ? (
                    <div className="flex items-center justify-between bg-marvvn-gray-50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs font-semibold">{promoCode}</span>
                      </div>
                      <button type="button" onClick={removePromoCode} className="text-marvvn-gray-400 hover:text-marvvn-red cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Discount code"
                        value={promoInput}
                        onChange={(e) => { setPromoInput(e.target.value); setPromoError('') }}
                        className="flex-1 px-3 py-2 text-xs border border-marvvn-gray-300 focus:border-marvvn-black focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!promoInput.trim()) return
                          const ok = await applyPromoCode(promoInput)
                          if (!ok) setPromoError('Invalid promo code')
                          else setPromoInput('')
                        }}
                        className="px-3 py-2 text-xs font-medium border border-marvvn-gray-300 hover:border-marvvn-black transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  {promoError && <p className="text-[11px] text-red-500 mt-1">{promoError}</p>}
                </div>

                {/* Totals */}
                <div className="border-t border-marvvn-gray-100 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-marvvn-gray-500">Subtotal</span>
                    <span>{formatPrice(totalPrice())}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discount}%)</span>
                      <span>-{formatPrice(totalPrice() - finalPrice())}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-marvvn-gray-500">Shipping</span>
                    <span>{shippingCost === 0 ? <span className="text-green-600 font-medium">Free</span> : formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-marvvn-gray-100 text-sm font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { icon: Truck, label: 'Free Shipping', sub: `On orders above ${formatPrice(freeShippingThreshold)}` },
                  { icon: ShieldCheck, label: 'Secure Payment', sub: '256-bit SSL encryption' },
                  { icon: RotateCcw, label: 'Easy Returns', sub: '7-day return policy' },
                ].map((badge) => (
                  <div key={badge.label} className="text-center p-3 bg-marvvn-gray-50">
                    <badge.icon className="w-5 h-5 text-marvvn-gray-400 mx-auto mb-1" />
                    <p className="text-[10px] font-semibold text-marvvn-black">{badge.label}</p>
                    <p className="text-[9px] text-marvvn-gray-400 leading-tight">{badge.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
