'use client'

import { useState, useEffect } from 'react'
import { MapPin, Plus, Pencil, Trash2, Check, Loader2 } from 'lucide-react'

interface Address {
  id: string
  first_name: string
  last_name: string
  address: string
  apartment?: string
  city: string
  state: string
  pincode: string
  phone?: string
  is_default: boolean
}

const emptyForm = {
  firstName: '',
  lastName: '',
  address: '',
  apartment: '',
  city: '',
  state: '',
  pincode: '',
  phone: '',
  isDefault: false,
}

export default function AddressesManager() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/addresses')
      const data = await res.json()
      setAddresses(data.addresses || [])
    } catch {}
    setLoading(false)
  }

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.address || !form.city || !form.state || !form.pincode) {
      setError('Please fill in all required fields')
      return
    }

    setSaving(true)
    setError('')

    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { ...form, id: editingId } : form

      const res = await fetch('/api/addresses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      await fetchAddresses()
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
    } catch (err: any) {
      setError(err.message)
    }
    setSaving(false)
  }

  const handleEdit = (addr: Address) => {
    setForm({
      firstName: addr.first_name,
      lastName: addr.last_name,
      address: addr.address,
      apartment: addr.apartment || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      phone: addr.phone || '',
      isDefault: addr.is_default,
    })
    setEditingId(addr.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return
    try {
      await fetch(`/api/addresses?id=${id}`, { method: 'DELETE' })
      await fetchAddresses()
    } catch {}
  }

  const handleSetDefault = async (id: string) => {
    const addr = addresses.find(a => a.id === id)
    if (!addr) return
    try {
      await fetch('/api/addresses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addr, firstName: addr.first_name, lastName: addr.last_name, isDefault: true }),
      })
      await fetchAddresses()
    } catch {}
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-marvvn-gray-400" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-medium text-lg">Saved Addresses</h2>
        <button
          onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-marvvn-black text-white text-sm font-medium hover:bg-marvvn-gray-900 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-5 border border-marvvn-gray-200 bg-marvvn-gray-50">
          <h3 className="font-medium mb-4">{editingId ? 'Edit Address' : 'New Address'}</h3>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First name *"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="px-3 py-2 text-sm border border-marvvn-gray-300 focus:border-marvvn-black focus:outline-none"
            />
            <input
              type="text"
              placeholder="Last name *"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="px-3 py-2 text-sm border border-marvvn-gray-300 focus:border-marvvn-black focus:outline-none"
            />
          </div>
          <input
            type="text"
            placeholder="Address *"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full mt-3 px-3 py-2 text-sm border border-marvvn-gray-300 focus:border-marvvn-black focus:outline-none"
          />
          <input
            type="text"
            placeholder="Apartment, suite (optional)"
            value={form.apartment}
            onChange={(e) => setForm({ ...form, apartment: e.target.value })}
            className="w-full mt-3 px-3 py-2 text-sm border border-marvvn-gray-300 focus:border-marvvn-black focus:outline-none"
          />
          <div className="grid grid-cols-3 gap-3 mt-3">
            <input
              type="text"
              placeholder="City *"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="px-3 py-2 text-sm border border-marvvn-gray-300 focus:border-marvvn-black focus:outline-none"
            />
            <input
              type="text"
              placeholder="State *"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="px-3 py-2 text-sm border border-marvvn-gray-300 focus:border-marvvn-black focus:outline-none"
            />
            <input
              type="text"
              placeholder="Pincode *"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              className="px-3 py-2 text-sm border border-marvvn-gray-300 focus:border-marvvn-black focus:outline-none"
            />
          </div>
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full mt-3 px-3 py-2 text-sm border border-marvvn-gray-300 focus:border-marvvn-black focus:outline-none"
          />
          <label className="flex items-center gap-2 mt-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="accent-marvvn-black"
            />
            <span className="text-sm text-marvvn-gray-600">Set as default</span>
          </label>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-marvvn-black text-white text-sm font-medium hover:bg-marvvn-gray-900 cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null) }}
              className="px-5 py-2 border border-marvvn-gray-300 text-sm hover:bg-white cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="border border-dashed border-marvvn-gray-300 p-8 text-center">
          <MapPin className="w-12 h-12 text-marvvn-gray-300 mx-auto mb-3" />
          <p className="text-marvvn-gray-500 mb-1">No saved addresses yet</p>
          <p className="text-sm text-marvvn-gray-400 mb-4">Add an address for faster checkout</p>
          <button
            onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true) }}
            className="text-sm font-medium text-marvvn-black underline hover:no-underline cursor-pointer"
          >
            Add your first address
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-4 border ${addr.is_default ? 'border-marvvn-black' : 'border-marvvn-gray-200'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold">{addr.first_name} {addr.last_name}</span>
                {addr.is_default && (
                  <span className="px-2 py-0.5 bg-marvvn-black text-white text-[10px] font-medium">Default</span>
                )}
              </div>
              <p className="text-sm text-marvvn-gray-600">{addr.address}{addr.apartment ? `, ${addr.apartment}` : ''}</p>
              <p className="text-sm text-marvvn-gray-600">{addr.city}, {addr.state} {addr.pincode}</p>
              {addr.phone && <p className="text-sm text-marvvn-gray-500 mt-1">{addr.phone}</p>}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-marvvn-gray-100">
                <button onClick={() => handleEdit(addr)} className="text-xs text-marvvn-gray-500 hover:text-marvvn-black cursor-pointer flex items-center gap-1">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                {!addr.is_default && (
                  <button onClick={() => handleSetDefault(addr.id)} className="text-xs text-marvvn-gray-500 hover:text-marvvn-black cursor-pointer flex items-center gap-1">
                    <Check className="w-3 h-3" /> Default
                  </button>
                )}
                <button onClick={() => handleDelete(addr.id)} className="text-xs text-red-500 hover:text-red-700 cursor-pointer flex items-center gap-1 ml-auto">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
