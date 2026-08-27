'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'

const statusOptions = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
const paymentOptions = ['pending', 'paid', 'failed', 'refunded']

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order)
          setStatus(data.order.status)
          setPaymentStatus(data.order.payment_status)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleUpdate = async () => {
    setSaving(true)
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, payment_status: paymentStatus }),
      })
    } catch {}
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-marvvn-black border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-marvvn-gray-500">Order not found</p>
        <Link href="/admin/orders" className="btn-primary mt-4 inline-block">Back to Orders</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/orders" className="p-2 hover:bg-marvvn-gray-100 rounded transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-medium">Order {order.id.slice(0, 8)}...</h1>
          <p className="text-sm text-marvvn-gray-500">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white border p-6">
            <h2 className="font-medium mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex gap-4 items-center py-3 border-b last:border-0">
                  <div className="w-16 h-20 bg-marvvn-gray-100 flex-shrink-0 overflow-hidden">
                    <Image
                      src={item.products?.images?.[0] || '/placeholder.png'}
                      alt={item.products?.title || ''}
                      width={64}
                      height={80}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.products?.title || 'Unknown Product'}</p>
                    <p className="text-xs text-marvvn-gray-500">
                      {item.size} / {item.color} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white border p-6">
            <h2 className="font-medium mb-4">Shipping Address</h2>
            <div className="text-sm text-marvvn-gray-600 space-y-1">
              <p className="font-medium text-marvvn-black">
                {order.shipping_address?.firstName} {order.shipping_address?.lastName}
              </p>
              <p>{order.shipping_address?.email}</p>
              <p>{order.shipping_address?.phone}</p>
              <p>{order.shipping_address?.address}</p>
              <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pincode}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="bg-white border p-6">
            <h2 className="font-medium mb-4">Update Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Order Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input-field"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="input-field"
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
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Update Order'}
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white border p-6">
            <h2 className="font-medium mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-marvvn-gray-600">Subtotal</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({order.discount}%)</span>
                  <span>-{formatPrice(order.total * order.discount / 100)}</span>
                </div>
              )}
              {order.promo_code && (
                <div className="flex justify-between">
                  <span className="text-marvvn-gray-600">Promo</span>
                  <span className="font-medium">{order.promo_code}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-marvvn-gray-600">Payment</span>
                <span className="capitalize">{order.payment_method || 'N/A'}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
