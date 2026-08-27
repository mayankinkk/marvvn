'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Mail, ShoppingCart, IndianRupee, Eye } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/customers')
      .then((res) => res.json())
      .then((data) => { setCustomers(data.customers || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = customers.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-marvvn-black border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-medium">Customers</h1>
          <p className="text-sm text-marvvn-gray-500 mt-1">{customers.length} registered users</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-marvvn-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-marvvn-gray-500">
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Orders</th>
                <th className="px-6 py-3 font-medium">Total Spent</th>
                <th className="px-6 py-3 font-medium">Last Order</th>
                <th className="px-6 py-3 font-medium">Joined</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-marvvn-gray-400">No customers found</td></tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer.id} className="border-b last:border-0 hover:bg-marvvn-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-marvvn-black to-marvvn-gray-700 flex items-center justify-center text-white text-sm font-bold">
                          {(customer.name || customer.email || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{customer.name || 'No name'}</p>
                          <p className="text-xs text-marvvn-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1">
                        <ShoppingCart className="w-3 h-3 text-marvvn-gray-400" />
                        {customer.totalOrders}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{formatPrice(customer.totalSpent)}</td>
                    <td className="px-6 py-4 text-marvvn-gray-500">
                      {customer.lastOrder ? new Date(customer.lastOrder.created_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-marvvn-gray-500">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {customer.is_admin && (
                        <span className="px-2 py-0.5 text-xs bg-marvvn-black text-white rounded-full">Admin</span>
                      )}
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
