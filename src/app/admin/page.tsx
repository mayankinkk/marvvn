'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, ShoppingCart, Users, IndianRupee, Clock, ArrowUpRight, TrendingUp, Tag, CreditCard, RefreshCw } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Stats {
  totalRevenue: number
  pendingOrders: number
  totalProducts: number
  totalOrders: number
  totalUsers: number
  recentOrders: any[]
  dailyRevenue: { date: string; label: string; revenue: number; orders: number }[]
  statusBreakdown: { pending: number; confirmed: number; shipped: number; out_for_delivery: number; delivered: number; cancelled: number }
  topProducts: { title: string; handle: string; quantity: number; revenue: number }[]
  promoUsage: { code: string; count: number; totalDiscount: number }[]
  paymentMethods: { cod: number; upi: number; card: number }
  avgOrderValue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = () => {
    setLoading(true)
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchStats() }, [])

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full" />
      </div>
    )
  }

  if (!stats) return <p className="text-gray-400 text-center py-20">Failed to load dashboard</p>

  const maxRevenue = Math.max(...stats.dailyRevenue.map((d) => d.revenue), 1)

  const statCards = [
    { label: 'Revenue', value: formatPrice(stats.totalRevenue), icon: IndianRupee, color: 'bg-emerald-50 text-emerald-600 ring-emerald-100' },
    { label: 'Avg Order', value: formatPrice(stats.avgOrderValue), icon: TrendingUp, color: 'bg-blue-50 text-blue-600 ring-blue-100' },
    { label: 'Pending', value: stats.pendingOrders, icon: Clock, color: 'bg-amber-50 text-amber-600 ring-amber-100' },
    { label: 'Products', value: stats.totalProducts, icon: Package, color: 'bg-purple-50 text-purple-600 ring-purple-100' },
    { label: 'Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-rose-50 text-rose-600 ring-rose-100' },
    { label: 'Users', value: stats.totalUsers, icon: Users, color: 'bg-cyan-50 text-cyan-600 ring-cyan-100' },
  ]

  const statusConfig: Record<string, { color: string; dot: string }> = {
    pending: { color: 'text-amber-700 bg-amber-50', dot: 'bg-amber-400' },
    confirmed: { color: 'text-blue-700 bg-blue-50', dot: 'bg-blue-400' },
    shipped: { color: 'text-purple-700 bg-purple-50', dot: 'bg-purple-400' },
    out_for_delivery: { color: 'text-orange-700 bg-orange-50', dot: 'bg-orange-400' },
    delivered: { color: 'text-emerald-700 bg-emerald-50', dot: 'bg-emerald-400' },
    cancelled: { color: 'text-red-700 bg-red-50', dot: 'bg-red-400' },
  }

  const totalStatus = Object.values(stats.statusBreakdown).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome back. Here is your store overview.</p>
        </div>
        <button
          type="button"
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-white transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${card.color} ring-1 flex items-center justify-center`}>
                <card.icon className="w-[18px] h-[18px]" />
              </div>
            </div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{card.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Chart + Status */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-900">Revenue</h2>
            <span className="text-[11px] text-gray-400 font-medium">Last 7 days</span>
          </div>
          <div className="flex items-end gap-1.5 h-44">
            {stats.dailyRevenue.map((day, i) => {
              const height = Math.max((day.revenue / maxRevenue) * 140, 3)
              const isToday = i === stats.dailyRevenue.length - 1
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                    {formatPrice(day.revenue)}
                  </span>
                  <div
                    className={`w-full rounded-sm transition-all duration-300 ${
                      isToday ? 'bg-gray-900' : 'bg-gray-200 group-hover:bg-gray-300'
                    }`}
                    style={{ height: `${height}px` }}
                  />
                  <span className={`text-[10px] font-medium ${isToday ? 'text-gray-900' : 'text-gray-400'}`}>
                    {day.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Order Status</h2>
          <div className="space-y-3.5">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => (
              <div key={status}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${statusConfig[status]?.dot}`} />
                    <span className="text-[13px] text-gray-600 capitalize">{status}</span>
                  </div>
                  <span className="text-[13px] font-semibold text-gray-900">{count}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${statusConfig[status]?.dot}`}
                    style={{ width: `${(count / totalStatus) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Top Products</h2>
          {stats.topProducts.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-[13px] text-gray-400">No sales yet</p>
            </div>
          ) : (
            <div className="space-y-0">
              {stats.topProducts.map((product, i) => (
                <div key={product.handle} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <span className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-500">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-900 truncate">{product.title}</p>
                    <p className="text-[11px] text-gray-400">{product.quantity} sold</p>
                  </div>
                  <span className="text-[13px] font-semibold text-gray-900">{formatPrice(product.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Payment Methods</h2>
          <div className="space-y-4">
            {[
              { label: 'Cash on Delivery', count: stats.paymentMethods.cod, icon: '💵', bg: 'bg-green-500' },
              { label: 'UPI', count: stats.paymentMethods.upi, icon: '📱', bg: 'bg-blue-500' },
              { label: 'Card', count: stats.paymentMethods.card, icon: '💳', bg: 'bg-purple-500' },
            ].map((pm) => (
              <div key={pm.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{pm.icon}</span>
                    <span className="text-[13px] font-medium text-gray-700">{pm.label}</span>
                  </div>
                  <span className="text-[13px] font-semibold text-gray-900">{pm.count}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pm.bg}`}
                    style={{ width: `${stats.totalOrders > 0 ? (pm.count / stats.totalOrders) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promo Usage */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Promo Codes</h2>
            <Link href="/admin/coupons" className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors">
              Manage
            </Link>
          </div>
          {stats.promoUsage.length === 0 ? (
            <div className="py-8 text-center">
              <Tag className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-[13px] text-gray-400">No codes used yet</p>
            </div>
          ) : (
            <div className="space-y-0">
              {stats.promoUsage.map((promo) => (
                <div key={promo.code} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-[13px] font-semibold text-gray-900 font-mono">{promo.code}</p>
                    <p className="text-[11px] text-gray-400">{promo.count} uses</p>
                  </div>
                  <span className="text-[13px] font-semibold text-red-500">-{formatPrice(promo.totalDiscount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-0">
          <h2 className="text-sm font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-[12px] text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Order</th>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Items</th>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-5 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <ShoppingCart className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-[13px] text-gray-400">No orders yet</p>
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((order: any) => {
                  const sc = statusConfig[order.status] || statusConfig.pending
                  return (
                    <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 font-mono text-[12px] text-gray-500">#{order.id.slice(0, 8)}</td>
                      <td className="px-5 py-3">
                        <p className="text-[13px] font-medium text-gray-900">{order.shipping_address?.firstName} {order.shipping_address?.lastName}</p>
                        <p className="text-[11px] text-gray-400">{order.shipping_address?.email}</p>
                      </td>
                      <td className="px-5 py-3 text-[13px] text-gray-600">{order.order_items?.length || 0}</td>
                      <td className="px-5 py-3 text-[13px] font-semibold text-gray-900">{formatPrice(order.total)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full capitalize ${sc.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[13px] text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="text-[13px] font-medium text-gray-900 hover:text-gray-600 transition-colors">
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
