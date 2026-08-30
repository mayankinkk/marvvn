'use client'

import { useState, useEffect } from 'react'
import { Send, Clock, CheckCircle, XCircle, Plus, MessageCircle, ShoppingCart, Package } from 'lucide-react'

interface Campaign {
  id: string
  type: string
  title: string
  message: string
  status: string
  recipient_count: number
  sent_count: number
  failed_count: number
  sent_at: string | null
  created_at: string
}

const campaignTypes = [
  { value: 'new_arrival', label: 'New Arrival Alert', icon: Package, description: 'Notify customers about new products' },
  { value: 'abandoned_cart', label: 'Abandoned Cart Reminder', icon: ShoppingCart, description: 'Remind customers with pending carts' },
]

const statusConfig: Record<string, { color: string; icon: any }> = {
  draft: { color: 'bg-gray-100 text-gray-600', icon: Clock },
  sending: { color: 'bg-blue-100 text-blue-600', icon: Send },
  sent: { color: 'bg-green-100 text-green-600', icon: CheckCircle },
  failed: { color: 'bg-red-100 text-red-600', icon: XCircle },
}

export default function WhatsAppCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({
    type: 'new_arrival',
    title: '',
    message: '',
  })

  const fetchCampaigns = () => {
    fetch('/api/admin/whatsapp-campaigns')
      .then(r => r.json())
      .then(d => { setCampaigns(d.campaigns || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchCampaigns() }, [])

  const handleSend = async () => {
    if (!form.title || !form.message) return
    setSending(true)

    try {
      const res = await fetch('/api/admin/whatsapp-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (res.ok) {
        setShowForm(false)
        setForm({ type: 'new_arrival', title: '', message: '' })
        fetchCampaigns()
      } else {
        alert(data.error || 'Failed to send campaign')
      }
    } catch {
      alert('Something went wrong')
    }
    setSending(false)
  }

  const presets: Record<string, { title: string; message: string }> = {
    new_arrival: {
      title: 'New Arrivals Just Dropped!',
      message: '🛍️ *New Arrivals at MARVVN!*\n\nCheck out our latest collection just dropped. Limited stock available!\n\nShop now: https://marvvn.online/shop\n\nHurry, before it sells out! 🔥',
    },
    abandoned_cart: {
      title: 'Complete Your Order',
      message: '🛒 *Hey, still thinking about it?*\n\nYour cart is waiting! Complete your order before these items sell out.\n\nComplete now: https://marvvn.online/cart\n\nUse code WELCOME10 for 10% off!',
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-medium">WhatsApp Campaigns</h1>
          <p className="text-sm text-marvvn-gray-500 mt-1">Send bulk WhatsApp messages to customers</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-marvvn-black text-white text-sm rounded-lg hover:bg-marvvn-gray-800 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* New Campaign Form */}
      {showForm && (
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="font-medium flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Create Campaign
          </h2>

          {/* Campaign Type */}
          <div className="grid md:grid-cols-2 gap-3">
            {campaignTypes.map(ct => (
              <button
                key={ct.value}
                onClick={() => {
                  setForm({ ...form, type: ct.value, ...presets[ct.value] })
                }}
                className={`p-4 border rounded-lg text-left cursor-pointer transition-colors ${
                  form.type === ct.value ? 'border-marvvn-black bg-marvvn-gray-50' : 'border-marvvn-gray-200 hover:border-marvvn-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ct.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{ct.label}</span>
                </div>
                <p className="text-xs text-marvvn-gray-500">{ct.description}</p>
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Campaign Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Weekend Sale Alert"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Type your message here... Use *bold* for bold text"
              rows={6}
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
            />
            <p className="text-xs text-marvvn-gray-400 mt-1">
              Preview: {form.message.slice(0, 100)}{form.message.length > 100 ? '...' : ''}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSend}
              disabled={sending || !form.title || !form.message}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send Campaign'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 border text-sm rounded-lg hover:bg-marvvn-gray-50 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Campaign History */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-medium">Campaign History</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-marvvn-gray-400">Loading...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-8 text-center text-marvvn-gray-400">No campaigns yet</div>
        ) : (
          <div className="divide-y">
            {campaigns.map(campaign => {
              const cfg = statusConfig[campaign.status] || statusConfig.draft
              const StatusIcon = cfg.icon
              return (
                <div key={campaign.id} className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">{campaign.title}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${cfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-xs text-marvvn-gray-500 truncate">{campaign.message}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-marvvn-gray-400">
                      <span className="capitalize">{campaign.type.replace('_', ' ')}</span>
                      <span>{campaign.sent_count}/{campaign.recipient_count} sent</span>
                      {campaign.failed_count > 0 && <span className="text-red-500">{campaign.failed_count} failed</span>}
                      <span>{new Date(campaign.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
