'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Clock, CheckCircle, UserX, Phone, Mail, Trash2, StickyNote, X } from 'lucide-react'

interface AbandonedCart {
  id: string
  user_id: string | null
  email: string
  items: { title: string; quantity: number; price: number; handle: string }[]
  total: number
  status: 'pending' | 'recovered' | 'contacted' | 'dismissed'
  notes: string | null
  created_at: string
  updated_at: string
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  recovered: { label: 'Recovered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  contacted: { label: 'Contacted', color: 'bg-blue-100 text-blue-800', icon: Phone },
  dismissed: { label: 'Dismissed', color: 'bg-gray-100 text-gray-500', icon: UserX },
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    fetchCarts()
  }, [filter])

  const fetchCarts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/abandoned-carts?status=${filter}`)
      const data = await res.json()
      setCarts(data.carts || [])
    } catch {}
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/abandoned-carts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setCarts(carts.map(c => c.id === id ? { ...c, status: status as any } : c))
  }

  const saveNotes = async (id: string) => {
    await fetch('/api/admin/abandoned-carts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, notes: noteText }),
    })
    setCarts(carts.map(c => c.id === id ? { ...c, notes: noteText } : c))
    setEditingNotes(null)
  }

  const deleteCart = async (id: string) => {
    if (!confirm('Delete this record?')) return
    await fetch(`/api/admin/abandoned-carts?id=${id}`, { method: 'DELETE' })
    setCarts(carts.filter(c => c.id !== id))
  }

  const stats = {
    total: carts.length,
    pending: carts.filter(c => c.status === 'pending').length,
    recovered: carts.filter(c => c.status === 'recovered').length,
    revenue: carts.filter(c => c.status === 'recovered').reduce((sum, c) => sum + c.total, 0),
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-medium">Abandoned Carts</h1>
          <p className="text-sm text-marvvn-gray-500 mt-1">Track and recover abandoned checkouts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-marvvn-gray-500 mb-1">Total Tracked</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-marvvn-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-marvvn-gray-500 mb-1">Recovered</p>
          <p className="text-2xl font-bold text-green-600">{stats.recovered}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-marvvn-gray-500 mb-1">Recovered Revenue</p>
          <p className="text-2xl font-bold">₹{stats.revenue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {(['all', 'pending', 'recovered', 'contacted', 'dismissed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              filter === s
                ? 'bg-marvvn-black text-white'
                : 'bg-marvvn-gray-100 text-marvvn-gray-600 hover:bg-marvvn-gray-200'
            }`}
          >
            {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-marvvn-black border-t-transparent rounded-full" />
        </div>
      ) : carts.length === 0 ? (
        <div className="text-center py-20 bg-white border rounded-xl">
          <ShoppingCart className="w-12 h-12 text-marvvn-gray-300 mx-auto mb-4" />
          <p className="text-marvvn-gray-400">No abandoned carts found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {carts.map((cart) => {
            const config = STATUS_CONFIG[cart.status]
            const StatusIcon = config.icon
            return (
              <div key={cart.id} className="bg-white border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${config.color}`}>
                        <StatusIcon className="w-3 h-3" /> {config.label}
                      </span>
                      <span className="text-xs text-marvvn-gray-400">
                        {new Date(cart.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-marvvn-gray-600 mb-3">
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {cart.email}</span>
                    </div>

                    {/* Items */}
                    <div className="border rounded-lg overflow-hidden mb-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-marvvn-gray-50 text-left text-xs text-marvvn-gray-500">
                            <th className="px-3 py-2 font-medium">Product</th>
                            <th className="px-3 py-2 font-medium text-center">Qty</th>
                            <th className="px-3 py-2 font-medium text-right">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(cart.items || []).map((item: any, i: number) => (
                            <tr key={i} className="border-b last:border-0">
                              <td className="px-3 py-2">{item.title}</td>
                              <td className="px-3 py-2 text-center">{item.quantity}</td>
                              <td className="px-3 py-2 text-right">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <p className="text-sm font-medium">Cart Total: ₹{cart.total.toLocaleString('en-IN')}</p>

                    {/* Notes */}
                    {editingNotes === cart.id ? (
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="text"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          className="input-field flex-1 text-sm"
                          placeholder="Add a note..."
                          autoFocus
                        />
                        <button onClick={() => saveNotes(cart.id)} className="btn-primary px-3 py-1.5 text-xs cursor-pointer">Save</button>
                        <button onClick={() => setEditingNotes(null)} className="p-1.5 hover:bg-marvvn-gray-100 rounded cursor-pointer"><X className="w-4 h-4" /></button>
                      </div>
                    ) : cart.notes ? (
                      <p className="mt-2 text-xs text-marvvn-gray-500 italic">Note: {cart.notes}</p>
                    ) : null}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => { setEditingNotes(cart.id); setNoteText(cart.notes || '') }}
                      className="p-1.5 hover:bg-marvvn-gray-100 rounded cursor-pointer"
                      title="Add note"
                    >
                      <StickyNote className="w-4 h-4 text-marvvn-gray-400" />
                    </button>
                    {cart.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(cart.id, 'contacted')}
                          className="p-1.5 hover:bg-blue-50 rounded cursor-pointer"
                          title="Mark as contacted"
                        >
                          <Phone className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => updateStatus(cart.id, 'recovered')}
                          className="p-1.5 hover:bg-green-50 rounded cursor-pointer"
                          title="Mark as recovered"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </button>
                        <button
                          onClick={() => updateStatus(cart.id, 'dismissed')}
                          className="p-1.5 hover:bg-marvvn-gray-100 rounded cursor-pointer"
                          title="Dismiss"
                        >
                          <UserX className="w-4 h-4 text-marvvn-gray-400" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteCart(cart.id)}
                      className="p-1.5 hover:bg-red-50 rounded cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-marvvn-gray-400 hover:text-marvvn-red" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
