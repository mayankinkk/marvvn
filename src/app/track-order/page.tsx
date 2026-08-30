'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { Search, Package, ChevronRight, Truck, CheckCircle, Clock, XCircle, MapPin, AlertTriangle } from 'lucide-react'

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock, description: 'Your order has been received' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, description: 'Your order has been confirmed' },
  { key: 'shipped', label: 'Shipped', icon: Truck, description: 'Your order is on the way' },
  { key: 'delivered', label: 'Delivered', icon: MapPin, description: 'Your order has been delivered' },
]

const statusColors: Record<string, string> = {
  pending: 'text-amber-600 bg-amber-50 border-amber-200',
  confirmed: 'text-blue-600 bg-blue-50 border-blue-200',
  shipped: 'text-purple-600 bg-purple-50 border-purple-200',
  delivered: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  cancelled: 'text-red-600 bg-red-50 border-red-200',
}

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [cancelMsg, setCancelMsg] = useState('')
  const { format } = useCurrency()

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setOrder(null)
    setLoading(true)

    try {
      const res = await fetch(`/api/track-order?orderId=${orderId.trim()}&email=${email.trim()}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Order not found')
      } else {
        setOrder(data.order)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const currentStepIndex = order ? statusSteps.findIndex(s => s.key === order.status) : -1

  const canCancel = order
    && (order.status === 'pending' || order.status === 'confirmed')
    && (Date.now() - new Date(order.created_at).getTime() < 60 * 60 * 1000)

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    setCancelMsg('')
    try {
      const res = await fetch('/api/cancel-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, email }),
      })
      const data = await res.json()
      if (res.ok) {
        setOrder({ ...order, status: 'cancelled' })
        setCancelMsg('Order cancelled successfully')
      } else {
        setCancelMsg(data.error || 'Failed to cancel')
      }
    } catch {
      setCancelMsg('Something went wrong')
    }
    setCancelling(false)
  }

  // Build timeline from status_history
  const timeline = order?.status_history || []
  const createdAt = order?.created_at

  function getDateForStep(stepKey: string): string | null {
    // Find the most recent entry in status_history matching this step
    const entry = timeline.find((h: any) => h.status === stepKey)
    if (entry) return new Date(entry.timestamp || entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    // For pending, use created_at
    if (stepKey === 'pending' && createdAt) return new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    return null
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-16">
        <nav className="flex items-center gap-2 text-xs text-marvvn-gray-500 mb-8">
          <Link href="/" className="hover:text-marvvn-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-marvvn-black">Track Order</span>
        </nav>

        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl lg:text-3xl font-display font-medium text-center mb-2">Track Your Order</h1>
          <p className="text-sm text-marvvn-gray-500 text-center mb-8">Enter your order ID and email to check the status</p>

          <form onSubmit={handleTrack} className="bg-white border p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Order ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. abc12345"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Used during checkout"
                className="input-field"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-sm text-red-700 text-center">
              {error}
            </div>
          )}

          {order && (
            <div className="mt-6 bg-white border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-marvvn-gray-400">Order</p>
                  <p className="font-mono text-sm font-medium">#{order.id.slice(0, 8)}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize border ${statusColors[order.status] || ''}`}>
                  {order.status}
                </span>
              </div>

              {/* Progress Steps with Dates */}
              <div className="space-y-0 mb-6">
                {statusSteps.map((step, i) => {
                  const isCompleted = currentStepIndex >= i
                  const isCurrent = currentStepIndex === i
                  const isCancelled = order.status === 'cancelled'
                  const date = getDateForStep(step.key)

                  return (
                    <div key={step.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCancelled ? 'bg-red-100 text-red-500' :
                          isCompleted ? 'bg-marvvn-black text-white' : 'bg-marvvn-gray-100 text-marvvn-gray-400'
                        }`}>
                          <step.icon className="w-4 h-4" />
                        </div>
                        {i < statusSteps.length - 1 && (
                          <div className={`w-0.5 h-8 ${isCompleted && !isCancelled ? 'bg-marvvn-black' : 'bg-marvvn-gray-200'}`} />
                        )}
                      </div>
                      <div className="pb-6">
                        <p className={`text-sm font-medium ${isCompleted ? 'text-marvvn-black' : 'text-marvvn-gray-400'}`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-marvvn-gray-400">{step.description}</p>
                        {date && (
                          <p className="text-[11px] text-marvvn-gray-400 mt-0.5 font-mono">{date}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
                {order.status === 'cancelled' && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-600">Cancelled</p>
                      <p className="text-xs text-marvvn-gray-400">This order has been cancelled</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="border-t pt-4">
                <p className="text-xs font-medium text-marvvn-gray-400 uppercase tracking-wider mb-3">Items</p>
                <div className="space-y-2">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-marvvn-gray-600">{item.quantity}x</span>
                        <span>{item.products?.title || 'Product'}</span>
                        {item.size && <span className="text-xs text-marvvn-gray-400">({item.size})</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-3 pt-3 flex justify-between font-medium">
                  <span className="text-sm">Total</span>
                  <span className="text-sm">{format(order.total || 0)}</span>
                </div>
              </div>

              {/* Cancel Order */}
              {canCancel && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-marvvn-gray-500">You can cancel this order within 1 hour of placing it. Once shipped, cancellation is not possible.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="w-full py-2.5 text-sm font-medium border border-red-300 text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                </div>
              )}
              {cancelMsg && (
                <div className={`mt-3 p-3 text-sm text-center rounded ${cancelMsg.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {cancelMsg}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
