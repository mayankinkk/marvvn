'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, ShoppingCart, Users, IndianRupee, Clock, ArrowUpRight, TrendingUp, Tag, CreditCard } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Stats {
  totalRevenue: number
  pendingOrders: number
  totalProducts: number
  totalOrders: number
  totalUsers: number
  recentOrders: any[]
  dailyRevenue: { date: string; label: string; revenue: number; orders: number }[]
  statusBreakdown: { pending: number; confirmed: number; shipped: number; delivered: number; cancelled: number }
  topProducts: { title: string; handle: string; quantity: number; revenue: number }[]
  promoUsage: { code: string; count: number; totalDiscount: number }[]
  paymentMethods: { cod: number; upi: number; card: number }
  avgOrderValue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-marvvn-black border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!stats) return <p className="text-marvvn-gray-500">Failed to load stats</p>

  const maxRevenue = Math.max(...stats.dailyRevenue.map((d) => d.revenue), 1)

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: IndianRupee, gradient: 'from-green-500 to-emerald-600', change: '+12%' },
    { label: 'Avg Order Value', value: formatPrice(stats.avgOrderValue), icon: TrendingUp, gradient: 'from-blue-500 to-indigo-600', change: '' },
    { label: 'Pending Orders', value: stats.pendingOrders.toString(), icon: Clock, gradient: 'from-amber-500 to-orange-600', change: '' },
    { label: 'Total Products', value: stats.totalProducts.toString(), icon: Package, gradient: 'from-purple-500 to-violet-600', change: '' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingCart, gradient: 'from-pink-500 to-rose-600', change: '' },
    { label: 'Total Users', value: stats.totalUsers.toString(), icon: Users, gradient: 'from-cyan-500 to-teal-600', change: '' },
  ]

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const statusBg: Record<string, string> = {
    pending: 'bg-amber-500',
    confirmed: 'bg-blue-500',
    shipped: 'bg-purple-500',
    delivered: 'bg-green-500',
    cancelled: 'bg-red-500',
  }

  const totalStatusOrders = Object.values(stats.statusBreakdown).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-medium">Dashboard</h1>
        <p className="text-sm text-marvvn-gray-500">Last updated: {new Date().toLocaleString()}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-marvvn-gray-500 mb-1">{card.label}</p>
            <p className="text-xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white border rounded-xl p-6">
          <h2 className="font-medium mb-6">Revenue (Last 7 Days)</h2>
          <div className="flex items-end gap-2 h-48">
            {stats.dailyRevenue.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-marvvn-gray-500">{formatPrice(day.revenue)}</span>
                <div
                  className="w-full bg-gradient-to-t from-marvvn-black to-marvvn-gray-700 rounded-t-md transition-all duration-500 hover:from-marvvn-gray-700 hover:to-marvvn-black"
                  style={{ height: `${Math.max((day.revenue / maxRevenue) * 140, 4)}px` }}
                />
                <span className="text-[10px] text-marvvn-gray-400 font-medium">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-medium mb-6">Order Status</h2>
          <div className="space-y-3">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => (
              <div key={status}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="capitalize text-marvvn-gray-600">{status}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="w-full h-2 bg-marvvn-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${statusBg[status]} transition-all duration-700`}
                    style={{ width: `${(count / totalStatusOrders) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-medium mb-4">Top Products</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-marvvn-gray-400 text-sm py-4 text-center">No sales yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((product, i) => (
                <div key={product.handle} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <span className="w-6 h-6 rounded-full bg-marvvn-gray-100 flex items-center justify-center text-xs font-bold text-marvvn-gray-600">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.title}</p>
                    <p className="text-xs text-marvvn-gray-400">{product.quantity} sold</p>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(product.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-medium mb-4">Payment Methods</h2>
          <div className="space-y-4">
            {[
              { label: 'Cash on Delivery', count: stats.paymentMethods.cod, icon: '💵', color: 'bg-green-500' },
              { label: 'UPI', count: stats.paymentMethods.upi, icon: '📱', color: 'bg-blue-500' },
              { label: 'Card', count: stats.paymentMethods.card, icon: '💳', color: 'bg-purple-500' },
            ].map((pm) => (
              <div key={pm.label} className="flex items-center gap-3">
                <span className="text-xl">{pm.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{pm.label}</p>
                  <div className="w-full h-1.5 bg-marvvn-gray-100 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pm.color}`}
                      style={{ width: `${stats.totalOrders > 0 ? (pm.count / stats.totalOrders) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium">{pm.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Promo Codes Used */}
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">Promo Usage</h2>
            <Link href="/admin/coupons" className="text-xs text-marvvn-gray-500 hover:text-marvvn-black">Manage</Link>
          </div>
          {stats.promoUsage.length === 0 ? (
            <p className="text-marvvn-gray-400 text-sm py-4 text-center">No promo codes used yet</p>
          ) : (
            <div className="space-y-3">
              {stats.promoUsage.map((promo) => (
                <div key={promo.code} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium font-mono">{promo.code}</p>
                    <p className="text-xs text-marvvn-gray-400">{promo.count} uses</p>
                  </div>
                  <span className="text-sm text-red-600">-{formatPrice(promo.totalDiscount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border rounded-xl">
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="font-medium">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-marvvn-gray-500 hover:text-marvvn-black flex items-center gap-1">
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-marvvn-gray-500">
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Items</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-marvvn-gray-400">No orders yet</td></tr>
              ) : (
                stats.recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-marvvn-gray-50">
                    <td className="px-6 py-3 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                    <td className="px-6 py-3">
                      <p className="font-medium">{order.shipping_address?.firstName} {order.shipping_address?.lastName}</p>
                      <p className="text-xs text-marvvn-gray-400">{order.shipping_address?.email}</p>
                    </td>
                    <td className="px-6 py-3">{order.order_items?.length || 0}</td>
                    <td className="px-6 py-3 font-medium">{formatPrice(order.total)}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${statusColors[order.status] || ''}`}>{order.status}</span>
                    </td>
                    <td className="px-6 py-3 text-marvvn-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-marvvn-black hover:underline text-sm">View</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
