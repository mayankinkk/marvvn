'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuthStore } from '@/lib/auth-store'
import { formatPrice } from '@/lib/utils'
import { ChevronRight, Package, Loader2, CreditCard, Eye, FileText, RotateCcw, CheckCircle, Truck, MapPin, Clock, X } from 'lucide-react'
import InvoiceButton from '@/components/InvoiceButton'

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  size: string
  color: string
  price: number
  products?: { title: string; images: string[]; handle: string }
}

interface Order {
  id: string
  total: number
  status: string
  payment_status: string
  payment_method: string
  created_at: string
  shipping_address: any
  order_items: OrderItem[]
  tracking_number?: string
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock, description: 'Your order has been placed' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, description: 'Order confirmed by team' },
  { key: 'shipped', label: 'Shipped', icon: Truck, description: 'Your order is on the way' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin, description: 'Out for delivery to you' },
  { key: 'delivered', label: 'Delivered', icon: MapPin, description: 'Order delivered to you' },
]

function OrderProgress({ status }: { status: string }) {
  const isCancelled = status === 'cancelled'
  const currentStepIndex = statusSteps.findIndex(s => s.key === status)

  return (
    <div className="px-4 py-4 border-b border-marvvn-gray-100">
      <div className="flex items-start justify-between">
        {statusSteps.map((step, i) => {
          const isCompleted = currentStepIndex >= i && !isCancelled
          const isCurrent = currentStepIndex === i
          return (
            <div key={step.key} className="flex-1 flex flex-col items-center text-center relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-colors ${
                isCancelled ? 'bg-marvvn-gray-100 text-marvvn-gray-400' :
                isCompleted ? 'bg-marvvn-black text-white' :
                'bg-marvvn-gray-100 text-marvvn-gray-400'
              }`}>
                <step.icon className="w-4 h-4" />
              </div>
              <p className={`text-[11px] font-medium ${isCompleted && !isCancelled ? 'text-marvvn-black' : 'text-marvvn-gray-400'}`}>
                {step.label}
              </p>
              <p className="text-[9px] text-marvvn-gray-400 mt-0.5 hidden sm:block">{step.description}</p>
              {i < statusSteps.length - 1 && (
                <div className={`absolute top-4 left-1/2 w-full h-0.5 ${
                  isCompleted && !isCancelled ? 'bg-marvvn-black' : 'bg-marvvn-gray-200'
                }`} style={{ zIndex: 0 }} />
              )}
            </div>
          )
        })}
        {isCancelled && (
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-1.5">
              <span className="text-sm font-bold">✕</span>
            </div>
            <p className="text-[11px] font-medium text-red-600">Cancelled</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const { user, isAuthenticated, loading } = useAuthStore()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [retryingId, setRetryingId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/account/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/orders', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => { setOrders(data.orders || []); setLoadingOrders(false) })
        .catch(() => setLoadingOrders(false))

      const interval = setInterval(() => {
        fetch('/api/orders', { cache: 'no-store' })
          .then((res) => res.json())
          .then((data) => { setOrders(data.orders || []) })
          .catch(() => {})
      }, 15000)

      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  async function handleRetryPayment(order: Order) {
    setRetryingId(order.id)
    try {
      const payRes = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: order.total, orderId: order.id }),
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
            body: JSON.stringify({ ...response, orderId: order.id }),
          })
          setOrders((prev) =>
            prev.map((o) =>
              o.id === order.id ? { ...o, payment_status: 'paid', status: 'confirmed' } : o
            )
          )
        },
        prefill: {
          name: order.shipping_address?.firstName
            ? `${order.shipping_address.firstName} ${order.shipping_address.lastName}`
            : '',
          email: order.shipping_address?.email || '',
          contact: order.shipping_address?.phone || '',
        },
        theme: { color: '#000000' },
        modal: {
          ondismiss: () => {
            setRetryingId(null)
          },
        },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.on('payment.failed', () => {
        setRetryingId(null)
      })
      razorpay.open()
    } catch {
      setRetryingId(null)
    }
  }

  const [returningId, setReturningId] = useState<string | null>(null)
  const [returnReason, setReturnReason] = useState('')
  const [showReturnForm, setShowReturnForm] = useState<string | null>(null)

  async function handleReturnRequest(orderId: string) {
    if (!returnReason.trim()) return
    setReturningId(orderId)
    try {
      await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, reason: returnReason }),
      })
      setShowReturnForm(null)
      setReturnReason('')
    } catch {}
    setReturningId(null)
  }

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

        {loadingOrders ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-marvvn-black border-t-transparent rounded-full" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-marvvn-gray-300 mx-auto mb-4" />
            <p className="text-marvvn-gray-500 mb-2">No orders yet</p>
            <p className="text-sm text-marvvn-gray-400 mb-6">Start shopping to see your orders here</p>
            <Link href="/collections/new-arrivals" className="btn-primary">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-marvvn-gray-200 rounded-lg overflow-hidden">
                {/* Order Header */}
                <div className="px-4 py-3 bg-marvvn-gray-50 border-b border-marvvn-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-marvvn-gray-500">
                      Order <span className="font-mono text-marvvn-black">{order.id.slice(0, 8)}...</span>
                    </span>
                    <span className="text-marvvn-gray-400">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    {order.payment_method !== 'cod' && order.payment_status !== 'paid' && (
                      <button
                        onClick={() => handleRetryPayment(order)}
                        disabled={retryingId === order.id}
                        className="flex items-center gap-1 px-2.5 py-1 bg-marvvn-black text-white rounded-full text-[11px] font-medium hover:bg-marvvn-gray-900 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {retryingId === order.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <CreditCard className="w-3 h-3" />
                        )}
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Progress */}
                <OrderProgress status={order.status} />

                {/* Order Items */}
                <div className="divide-y divide-marvvn-gray-100">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="px-4 py-3 flex items-center gap-3">
                      <div className="w-14 h-16 bg-marvvn-gray-50 relative flex-shrink-0 overflow-hidden">
                        {item.products?.images?.[0] ? (
                          <Image
                            src={item.products.images[0]}
                            alt={item.products?.title || ''}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-marvvn-gray-300">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.products?.title || 'Product'}</p>
                        <p className="text-xs text-marvvn-gray-400">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && ' · '}
                          {item.color && `Color: ${item.color}`}
                          {item.quantity > 1 && ` · Qty: ${item.quantity}`}
                        </p>
                      </div>
                      <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="px-4 py-3 bg-marvvn-gray-50 border-t border-marvvn-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-marvvn-gray-500">
                      {order.order_items?.length || 0} item{(order.order_items?.length || 0) > 1 ? 's' : ''}
                      {order.payment_method === 'cod' ? ' · Cash on Delivery' : ''}
                    </span>
                    <div className="flex items-center gap-3">
                      {order.payment_status && (
                        <span className={`text-[11px] font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {order.payment_status === 'paid' ? 'Paid' : 'Payment pending'}
                        </span>
                      )}
                      <span className="font-semibold">Total: {formatPrice(order.total)}</span>
                    </div>
                  </div>
                  {order.tracking_number && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-marvvn-gray-100">
                      <Truck className="w-3.5 h-3.5 text-marvvn-gray-400" />
                      <span className="text-xs text-marvvn-gray-500">Tracking:</span>
                      <span className="text-xs font-mono font-medium">{order.tracking_number}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2 pt-2 border-t border-marvvn-gray-100">
                    <InvoiceButton orderId={order.id} />
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <button
                        onClick={() => setShowReturnForm(showReturnForm === order.id ? null : order.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel Order
                      </button>
                    )}
                    {order.status === 'delivered' && (
                      <button
                        onClick={() => setShowReturnForm(showReturnForm === order.id ? null : order.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-marvvn-gray-500 hover:text-marvvn-black transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Return
                      </button>
                    )}
                  </div>
                  {showReturnForm === order.id && (
                    <div className="mt-2 pt-2 border-t border-marvvn-gray-100 space-y-2">
                      {(order.status === 'pending' || order.status === 'confirmed') ? (
                        <>
                          <p className="text-xs text-marvvn-gray-500">Are you sure you want to cancel this order? This action cannot be undone.</p>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                setReturningId(order.id)
                                try {
                                  const res = await fetch('/api/cancel-order', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ orderId: order.id, email: user?.email }),
                                  })
                                  if (res.ok) {
                                    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o))
                                  }
                                } catch {}
                                setShowReturnForm(null)
                                setReturningId(null)
                              }}
                              disabled={returningId === order.id}
                              className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer disabled:opacity-50"
                            >
                              {returningId === order.id ? 'Cancelling...' : 'Yes, Cancel'}
                            </button>
                            <button
                              onClick={() => setShowReturnForm(null)}
                              className="px-3 py-1.5 text-xs border border-marvvn-gray-300 rounded hover:bg-marvvn-gray-50 cursor-pointer"
                            >
                              Keep Order
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <textarea
                            value={returnReason}
                            onChange={e => setReturnReason(e.target.value)}
                            placeholder="Reason for return..."
                            className="w-full px-3 py-2 text-xs border border-marvvn-gray-200 rounded focus:outline-none focus:border-marvvn-black"
                            rows={2}
                          />
                          <button
                            onClick={() => handleReturnRequest(order.id)}
                            disabled={returningId === order.id || !returnReason.trim()}
                            className="px-3 py-1.5 text-xs bg-marvvn-black text-white rounded hover:bg-marvvn-gray-900 cursor-pointer disabled:opacity-50"
                          >
                            {returningId === order.id ? 'Submitting...' : 'Submit Return Request'}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
