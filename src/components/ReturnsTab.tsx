'use client'

import { useState, useEffect } from 'react'
import { RotateCcw, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface ReturnRequest {
  id: string
  order_id: string
  reason: string
  status: string
  admin_notes: string
  created_at: string
  orders?: { total: number }
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  completed: { label: 'Refunded', color: 'bg-green-100 text-green-800', icon: CheckCircle },
}

export default function ReturnsTab() {
  const [returns, setReturns] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')

  useEffect(() => {
    fetch('/api/returns')
      .then(res => res.json())
      .then(data => { setReturns(data.returns || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId || !reason) return
    setSubmitting(true)
    setSubmitMsg('')
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId.trim(), reason }),
      })
      const data = await res.json()
      if (res.ok) {
        setSubmitMsg('Return request submitted! We\'ll review it within 24-48 hours.')
        setOrderId('')
        setReason('')
        setShowForm(false)
        // Refresh list
        const refreshed = await fetch('/api/returns').then(r => r.json())
        setReturns(refreshed.returns || [])
      } else {
        setSubmitMsg(data.error || 'Failed to submit return request')
      }
    } catch {
      setSubmitMsg('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-display font-medium">Returns & Refunds</h2>
          <p className="text-sm text-marvvn-gray-400 mt-1">Return requests must be within 3 days of delivery</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Request Return
        </button>
      </div>

      {/* Return Request Form */}
      {showForm && (
        <div className="bg-white border p-6 mb-6">
          <h3 className="font-medium mb-4">New Return Request</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Order ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. abc12345 (from your order confirmation)"
                className="input-field w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reason for return</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Tell us why you want to return this order..."
                rows={3}
                className="input-field w-full resize-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary px-6 py-2 text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-6 py-2 text-sm cursor-pointer">
                Cancel
              </button>
            </div>
          </form>
          {submitMsg && (
            <p className={`text-sm mt-3 ${submitMsg.includes('submitted') ? 'text-green-600' : 'text-red-600'}`}>
              {submitMsg}
            </p>
          )}
        </div>
      )}

      {/* Return Requests List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-marvvn-gray-400" />
        </div>
      ) : returns.length === 0 ? (
        <div className="bg-white border p-8 text-center">
          <RotateCcw className="w-8 h-8 text-marvvn-gray-300 mx-auto mb-3" />
          <p className="text-sm text-marvvn-gray-400">No return requests yet</p>
          <p className="text-xs text-marvvn-gray-400 mt-1">Returns accepted within 3 days of delivery</p>
        </div>
      ) : (
        <div className="space-y-3">
          {returns.map(ret => {
            const status = statusConfig[ret.status] || statusConfig.pending
            const StatusIcon = status.icon
            return (
              <div key={ret.id} className="bg-white border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Order #{ret.order_id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-marvvn-gray-400 mt-1">{ret.reason}</p>
                    <p className="text-[11px] text-marvvn-gray-400 mt-1">
                      {new Date(ret.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {ret.admin_notes && (
                      <p className="text-xs text-marvvn-gray-500 mt-2 bg-gray-50 p-2 rounded">
                        <span className="font-medium">Admin note:</span> {ret.admin_notes}
                      </p>
                    )}
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
