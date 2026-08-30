'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, ShoppingBag, Users, Package, DollarSign, AlertTriangle, Percent } from 'lucide-react'

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d'>('30d')

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-marvvn-black border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!data) {
    return <div className="text-center py-20 text-marvvn-gray-500">Failed to load analytics</div>
  }

  const displayRevenue = period === '7d' ? data.dailyRevenue.slice(-7) : data.dailyRevenue
  const maxRevenue = Math.max(...displayRevenue.map((d: any) => d.revenue), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-medium">Analytics Dashboard</h1>
          <p className="text-sm text-marvvn-gray-500 mt-1">Revenue, orders, and product performance</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('7d')}
            className={`px-3 py-1.5 text-sm rounded cursor-pointer ${period === '7d' ? 'bg-marvvn-black text-white' : 'bg-marvvn-gray-100 text-marvvn-gray-600'}`}
          >
            7 Days
          </button>
          <button
            onClick={() => setPeriod('30d')}
            className={`px-3 py-1.5 text-sm rounded cursor-pointer ${period === '30d' ? 'bg-marvvn-black text-white' : 'bg-marvvn-gray-100 text-marvvn-gray-600'}`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={`₹${data.totalRevenue.toLocaleString('en-IN')}`} />
        <StatCard icon={ShoppingBag} label="Total Orders" value={data.totalOrders.toString()} />
        <StatCard icon={TrendingUp} label="Avg Order Value" value={`₹${Math.round(data.avgOrderValue).toLocaleString('en-IN')}`} />
        <StatCard icon={Percent} label="Conversion Rate" value={`${data.conversionRate.toFixed(1)}%`} />
        <StatCard icon={Package} label="Products" value={data.totalProducts.toString()} />
        <StatCard icon={Users} label="Customers" value={data.totalUsers.toString()} />
        <StatCard icon={AlertTriangle} label="Cancelled" value={data.cancelledOrders.toString()} />
        <StatCard icon={BarChart3} label="Low Stock" value={data.lowStockProducts.length.toString()} />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-medium mb-4">Revenue Trend ({period === '7d' ? 'Last 7 Days' : 'Last 30 Days'})</h2>
        <div className="flex items-end gap-1 h-48">
          {displayRevenue.map((day: any, i: number) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-marvvn-black rounded-t transition-all"
                style={{ height: `${(day.revenue / maxRevenue) * 100}%`, minHeight: day.revenue > 0 ? '4px' : '0' }}
                title={`₹${day.revenue.toLocaleString('en-IN')}`}
              />
              {i % (period === '7d' ? 1 : 5) === 0 && (
                <span className="text-[10px] text-marvvn-gray-400">{day.date.slice(5)}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-medium mb-4">Top Products by Revenue</h2>
          <div className="space-y-3">
            {data.topProducts.slice(0, 8).map((p: any, i: number) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-marvvn-gray-400 w-5">{i + 1}.</span>
                  <span className="truncate max-w-[200px]">{p.title}</span>
                </div>
                <div className="flex items-center gap-3 text-marvvn-gray-500">
                  <span>{p.quantity} sold</span>
                  <span className="font-medium text-marvvn-black">₹{p.revenue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Revenue */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-medium mb-4">Revenue by Category</h2>
          <div className="space-y-3">
            {Object.entries(data.categoryRevenue)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([cat, rev]) => (
                <div key={cat} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{cat}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-marvvn-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-marvvn-black rounded-full"
                        style={{ width: `${((rev as number) / data.totalRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="font-medium">₹{(rev as number).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Top Sizes */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-medium mb-4">Top Sizes</h2>
          <div className="space-y-2">
            {data.topSizes.map((s: any) => (
              <div key={s.size} className="flex items-center justify-between text-sm">
                <span>{s.size}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-marvvn-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-marvvn-black rounded-full"
                      style={{ width: `${(s.count / data.topSizes[0].count) * 100}%` }}
                    />
                  </div>
                  <span className="text-marvvn-gray-500 w-8 text-right">{s.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-medium mb-4">Payment Methods</h2>
          <div className="space-y-3">
            {Object.entries(data.paymentMethods).map(([method, info]: [string, any]) => (
              <div key={method} className="flex items-center justify-between text-sm">
                <span className="uppercase font-medium">{method}</span>
                <div className="flex items-center gap-3 text-marvvn-gray-500">
                  <span>{info.count} orders</span>
                  <span className="font-medium text-marvvn-black">₹{info.revenue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        {data.lowStockProducts.length > 0 && (
          <div className="bg-white border rounded-xl p-6 lg:col-span-2">
            <h2 className="font-medium mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Low Stock Alert (≤5 units)
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.lowStockProducts.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-amber-50 rounded text-sm">
                  <span className="truncate">{p.title}</span>
                  <span className={`font-medium ${p.stock <= 2 ? 'text-red-600' : 'text-amber-600'}`}>{p.stock} left</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-marvvn-gray-100 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-marvvn-gray-600" />
        </div>
        <div>
          <p className="text-xs text-marvvn-gray-500">{label}</p>
          <p className="text-lg font-medium">{value}</p>
        </div>
      </div>
    </div>
  )
}
