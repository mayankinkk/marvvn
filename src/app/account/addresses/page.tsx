'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuthStore } from '@/lib/auth-store'
import { ChevronRight, MapPin, Plus, Pencil, Trash2, Check, Loader2 } from 'lucide-react'

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

const emptyAddress = {
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

export default function AddressesPage() {
  const { isAuthenticated, loading } = useAuthStore()
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyAddress)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/account/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses()
    }
  }, [isAuthenticated])

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/addresses')
      const data = await res.json()
      setAddresses(data.addresses || [])
    } catch {}
    setLoadingAddresses(false)
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
        throw new Error(data.error || 'Failed to save address')
      }

      await fetchAddresses()
      setShowForm(false)
      setEditingId(null)
      setForm(emptyAddress)
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

  if (loading || !isAuthenticated) return null

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-xs text-marvvn-gray-500 mb-6">
          <Link href="/" className="hover:text-marvvn-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/account" className="hover:text-marvvn-black">Account</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-marvvn-black">Addresses</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl lg:text-3xl font-display font-medium">Saved Addresses</h1>
          <button
            onClick={() => { setForm(emptyAddress); setEditingId(null); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-marvvn-black text-white text-sm font-medium hover:bg-marvvn-gray-900 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Address
          </button>
        </div>

        {showForm && (
          <div className="mb-8 p-6 border border-marvvn-gray-200 bg-white">
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Address' : 'Add New Address'}</h2>
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First name *"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="px-3 py-2.5 text-sm border border-marvvn-gray-300 focus:border-marvvn-black focus:outline-none"
              />
              <input
                type="text"
                placeholder="Last name *"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="px-3 py-2.5 text-sm border border-marvvn-gray-300 focus:border-marvvn-black focus:outline-none"
              />
            </div>
            <input
              type="text"
              placeholder="Address *"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full mt-4 px-3 py-2.5 text-sm border border-marvvn-gray-300 focus:border-marvvn-black focus:outline-none"
            />
            <input
              type="text"
              placeholder="Apartment, suite, etc. (optional)"
              value={form.apartment}
              onChange={(e) => setForm({ ...form, apartment: e.target.value })}
              className="w-full mt-4 px-3 py-2.5 text-sm border border-marvvn-gray-300 focus:border-marvvn-black focus:outline-none"
            />
            <div className="grid grid-cols-3 gap-4 mt-4">
              <input
                type="text"
                placeholder="City *"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="px-3 py-2.5 text-sm border border-marvvn-gray-300 focus:border-marvvn-black focus:outline-none"
              />
              <input
                type="text"
                placeholder="State *"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="px-3 py-2.5 text-sm border border-marvvn-gray-300 focus:border-marvvn-black focus:outline-none"
              />
              <input
                type="text"
                placeholder="Pincode *"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                className="px-3 py-2.5 text-sm border border-marvvn-gray-300 focus:border-marvvn-black focus:outline-none"
              />
            </div>
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full mt-4 px-3 py-2.5 text-sm border border-marvvn-gray-300 focus:border-marvvn-black focus:outline-none"
            />
            <label className="flex items-center gap-2 mt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="accent-marvvn-black"
              />
              <span className="text-sm text-marvvn-gray-600">Set as default address</span>
            </label>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-marvvn-black text-white text-sm font-medium hover:bg-marvvn-gray-900 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Address'}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditingId(null) }}
                className="px-6 py-2.5 border border-marvvn-gray-300 text-sm font-medium hover:bg-marvvn-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loadingAddresses ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-marvvn-gray-400" />
          </div>
        ) : addresses.length === 0 && !showForm ? (
          <div className="text-center py-16 border border-dashed border-marvvn-gray-300">
            <MapPin className="w-12 h-12 text-marvvn-gray-300 mx-auto mb-4" />
            <p className="text-marvvn-gray-500 mb-4">No saved addresses</p>
            <button
              onClick={() => { setForm(emptyAddress); setEditingId(null); setShowForm(true) }}
              className="text-sm font-medium text-marvvn-black underline hover:no-underline cursor-pointer"
            >
              Add your first address
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-4 border ${addr.is_default ? 'border-marvvn-black' : 'border-marvvn-gray-200'} bg-white`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{addr.first_name} {addr.last_name}</span>
                    {addr.is_default && (
                      <span className="px-2 py-0.5 bg-marvvn-black text-white text-[10px] font-medium">Default</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-marvvn-gray-600 mb-1">{addr.address}{addr.apartment ? `, ${addr.apartment}` : ''}</p>
                <p className="text-sm text-marvvn-gray-600 mb-1">{addr.city}, {addr.state} {addr.pincode}</p>
                {addr.phone && <p className="text-sm text-marvvn-gray-500">{addr.phone}</p>}
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-marvvn-gray-100">
                  <button
                    onClick={() => handleEdit(addr)}
                    className="flex items-center gap-1 text-xs text-marvvn-gray-500 hover:text-marvvn-black cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  {!addr.is_default && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="flex items-center gap-1 text-xs text-marvvn-gray-500 hover:text-marvvn-black cursor-pointer"
                    >
                      <Check className="w-3 h-3" /> Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 cursor-pointer ml-auto"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
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
