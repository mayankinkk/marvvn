'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react'

interface ReturnRequest {
  id: string
  order_id: string
  user_id: string
  reason: string
  status: string
  admin_notes: string
  created_at: string
  orders?: { total: number; shipping_address: any }
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
}

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ReturnRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    fetch('/api/returns')
      .then(res => res.json())
      .then(data => { setReturns(data.returns || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleStatus = async (id: string, status: string) => {
    await fetch('/api/returns', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, admin_notes: adminNotes }),
    })
    setReturns(prev => prev.map(r => r.id === id ? { ...r, status, admin_notes: adminNotes } : r))
    setSelected(null)
    setAdminNotes('')
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
      <div className="mb-8">
        <h1 className="text-2xl font-display font-medium">Return Requests</h1>
        <p className="text-sm text-marvvn-gray-500 mt-1">{returns.length} total requests</p>
      </div>

      <div className="flex gap-6">
        <div className={`${selected ? 'hidden lg:block lg:w-1/2' : 'w-full'} bg-white border rounded-xl overflow-hidden`}>
          <div className="overflow-y-auto max-h-[600px]">
            {returns.length === 0 ? (
              <div className="px-6 py-12 text-center text-marvvn-gray-400">No return requests</div>
            ) : (
              returns.map(ret => (
                <div
                  key={ret.id}
                  onClick={() => { setSelected(ret); setAdminNotes(ret.admin_notes || '') }}
                  className={`px-6 py-4 border-b last:border-0 cursor-pointer transition-colors ${
                    selected?.id === ret.id ? 'bg-marvvn-gray-50' : 'hover:bg-marvvn-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">#{ret.order_id.slice(0, 8)}</p>
                      <p className="text-xs text-marvvn-gray-400 mt-0.5 truncate max-w-xs">{ret.reason}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusColors[ret.status] || ''}`}>
                      {ret.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`${selected ? 'w-full lg:w-1/2' : 'hidden'} bg-white border rounded-xl p-6`}>
          {selected ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium">Return #{selected.order_id.slice(0, 8)}</h2>
                <button onClick={() => setSelected(null)} className="text-marvvn-gray-400 hover:text-marvvn-gray-600 cursor-pointer lg:hidden">✕</button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs text-marvvn-gray-400 mb-1">Reason</p>
                  <p className="text-sm">{selected.reason}</p>
                </div>
                {selected.orders?.total && (
                  <div>
                    <p className="text-xs text-marvvn-gray-400 mb-1">Order Total</p>
                    <p className="text-sm font-medium">₹{selected.orders.total.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-marvvn-gray-400 mb-1">Requested</p>
                  <p className="text-sm">{new Date(selected.created_at).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Optional notes for the customer..."
                />
              </div>

              {selected.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatus(selected.id, 'approved')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleStatus(selected.id, 'rejected')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}

              {selected.status === 'approved' && (
                <button
                  onClick={() => handleStatus(selected.id, 'completed')}
                  className="w-full py-2.5 bg-marvvn-black text-white text-sm font-medium rounded hover:bg-marvvn-gray-900 cursor-pointer"
                >
                  Mark as Completed (Refund Processed)
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-marvvn-gray-400">
              Select a request to review
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
