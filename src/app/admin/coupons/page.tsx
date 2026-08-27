'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Coupon {
  id: string
  code: string
  discount_type: string
  discount_value: number
  min_cart: number
  max_uses: number | null
  used_count: number
  active: boolean
  expires_at: string | null
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_cart: '',
    max_uses: '',
    expires_at: '',
  })

  useEffect(() => {
    fetch('/api/admin/coupons')
      .then((res) => res.json())
      .then((data) => { setCoupons(data.coupons || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          discount_type: form.discount_type,
          discount_value: parseFloat(form.discount_value),
          min_cart: form.min_cart ? parseFloat(form.min_cart) : 0,
          max_uses: form.max_uses ? parseInt(form.max_uses) : null,
          expires_at: form.expires_at || null,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setCoupons([data.coupon, ...coupons])
        setShowForm(false)
        setForm({ code: '', discount_type: 'percentage', discount_value: '', min_cart: '', max_uses: '', expires_at: '' })
      }
    } catch {}
    setSaving(false)
  }

  const toggleActive = async (coupon: Coupon) => {
    await fetch('/api/admin/coupons', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: coupon.id, active: !coupon.active, discount_type: coupon.discount_type, discount_value: coupon.discount_value, min_cart: coupon.min_cart }),
    })
    setCoupons(coupons.map((c) => c.id === coupon.id ? { ...c, active: !c.active } : c))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return
    await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' })
    setCoupons(coupons.filter((c) => c.id !== id))
  }

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
          <h1 className="text-2xl font-display font-medium">Coupons</h1>
          <p className="text-sm text-marvvn-gray-500 mt-1">{coupons.length} total coupons</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2 text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">New Coupon</h2>
            <button type="button" onClick={() => setShowForm(false)} className="cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleCreate} className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="input-field font-mono"
                required
                placeholder="SUMMER20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                className="input-field"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Value *</label>
              <input
                type="number"
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                className="input-field"
                required
                min="0"
                step="0.01"
                placeholder={form.discount_type === 'percentage' ? '10' : '100'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Cart (₹)</label>
              <input
                type="number"
                value={form.min_cart}
                onChange={(e) => setForm({ ...form, min_cart: e.target.value })}
                className="input-field"
                min="0"
                placeholder="500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Uses</label>
              <input
                type="number"
                value={form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                className="input-field"
                min="1"
                placeholder="Unlimited"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expires</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="md:col-span-3">
              <button type="submit" disabled={saving} className="btn-primary px-6 py-2 text-sm cursor-pointer disabled:opacity-50">
                {saving ? 'Creating...' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-marvvn-gray-500">
                <th className="px-6 py-3 font-medium">Code</th>
                <th className="px-6 py-3 font-medium">Discount</th>
                <th className="px-6 py-3 font-medium">Min Cart</th>
                <th className="px-6 py-3 font-medium">Uses</th>
                <th className="px-6 py-3 font-medium">Expires</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-marvvn-gray-400">No coupons yet. Create one above.</td></tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b last:border-0 hover:bg-marvvn-gray-50">
                    <td className="px-6 py-3 font-mono font-bold">{coupon.code}</td>
                    <td className="px-6 py-3">
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : formatPrice(coupon.discount_value)}
                    </td>
                    <td className="px-6 py-3">{coupon.min_cart > 0 ? formatPrice(coupon.min_cart) : 'None'}</td>
                    <td className="px-6 py-3">
                      {coupon.used_count}{coupon.max_uses ? ` / ${coupon.max_uses}` : ''}
                    </td>
                    <td className="px-6 py-3 text-marvvn-gray-500">
                      {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${coupon.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                        {coupon.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => toggleActive(coupon)} className="cursor-pointer">
                          {coupon.active ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-marvvn-gray-400" />}
                        </button>
                        <button type="button" onClick={() => handleDelete(coupon.id)} className="p-1 hover:bg-red-50 rounded cursor-pointer">
                          <Trash2 className="w-4 h-4 text-marvvn-gray-400 hover:text-marvvn-red" />
                        </button>
                      </div>
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
