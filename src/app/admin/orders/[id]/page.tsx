'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Save, Package, CheckCircle, Truck, MapPin, XCircle, Clock, StickyNote } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock, description: 'Customer placed the order' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, description: 'Order confirmed by admin' },
  { key: 'shipped', label: 'Shipped', icon: Truck, description: 'Order has been shipped' },
  { key: 'delivered', label: 'Delivered', icon: MapPin, description: 'Order delivered to customer' },
]

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  shipped: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400' },
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
}

const paymentOptions = ['pending', 'paid', 'failed', 'refunded']

export default function AdminOrderDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order)
          setStatus(data.order.status)
          setPaymentStatus(data.order.payment_status)
          setNotes(data.order.notes || '')
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleUpdate = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, payment_status: paymentStatus, notes }),
      })
      if (res.ok) {
        const data = await res.json()
        setOrder(data.order)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {}
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Order not found</p>
        <Link href="/admin/orders" className="text-sm font-medium text-gray-900 underline mt-4 inline-block">Back to Orders</Link>
      </div>
    )
  }

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/orders" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-gray-400">Placed on {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${statusColors[order.status]?.bg} ${statusColors[order.status]?.text}`}>
          <span className={`w-2 h-2 rounded-full ${statusColors[order.status]?.dot}`} />
          {order.status}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left — Order Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Status Steps */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Order Progress</h2>
            <div className="flex items-start justify-between">
              {statusSteps.map((step, i) => {
                const isCompleted = currentStepIndex >= i && !isCancelled
                const isCurrent = currentStepIndex === i
                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      isCancelled ? 'bg-gray-100 text-gray-400' :
                      isCompleted ? 'bg-gray-900 text-white' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <p className={`text-xs font-medium ${isCompleted && !isCancelled ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 hidden sm:block">{step.description}</p>
                    {i < statusSteps.length - 1 && (
                      <div className={`w-full h-0.5 mt-3 ${isCompleted && !isCancelled ? 'bg-gray-900' : 'bg-gray-100'}`} style={{ position: 'absolute', width: '100%' }} />
                    )}
                  </div>
                )
              })}
              {isCancelled && (
                <div className="flex-1 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-2">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-red-600">Cancelled</p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Items ({order.order_items?.length || 0})</h2>
            <div className="space-y-0">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex gap-4 items-center py-3 border-b border-gray-50 last:border-0">
                  <div className="w-16 h-20 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden relative">
                    <Image
                      src={item.products?.images?.[0] || '/placeholder.png'}
                      alt={item.products?.title || ''}
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.products?.title || 'Unknown Product'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.size && `Size: ${item.size}`}{item.size && item.color && ' · '}{item.color && `Color: ${item.color}`}
                    </p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Shipping Address</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">
                {order.shipping_address?.firstName} {order.shipping_address?.lastName}
              </p>
              <p>{order.shipping_address?.email}</p>
              <p>{order.shipping_address?.phone}</p>
              <p>{order.shipping_address?.address}</p>
              {order.shipping_address?.apartment && <p>{order.shipping_address.apartment}</p>}
              <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pincode}</p>
            </div>
          </div>
        </div>

        {/* Right — Actions & Summary */}
        <div className="space-y-5">
          {/* Status Update */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Update Order</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Order Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none bg-white"
                >
                  {statusSteps.map((s) => (
                    <option key={s.key} value={s.key} className="capitalize">{s.label}</option>
                  ))}
                  <option value="cancelled" className="text-red-600">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none bg-white"
                >
                  {paymentOptions.map((s) => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={saving}
                className="w-full bg-gray-900 text-white py-2.5 text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Update Order'}
              </button>
              {saved && (
                <p className="text-xs text-emerald-600 text-center font-medium">Order updated. Customer notified via email + WhatsApp.</p>
              )}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">Internal Notes</h2>
            </div>
            <p className="text-xs text-gray-400 mb-3">Private notes about this order (not visible to customer)</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none resize-none"
              rows={3}
              placeholder="e.g. Customer called, delayed shipping by 2 days..."
            />
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-gray-900">{formatPrice(order.total + (order.discount || 0))}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              {order.promo_code && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Promo</span>
                  <span className="font-mono text-xs font-semibold text-gray-900">{order.promo_code}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Payment</span>
                <span className="text-gray-900 capitalize">{order.payment_method || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Status</span>
                <span className={`text-xs font-semibold capitalize ${order.payment_status === 'paid' ? 'text-emerald-600' : order.payment_status === 'failed' ? 'text-red-600' : 'text-amber-600'}`}>
                  {order.payment_status || 'pending'}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
