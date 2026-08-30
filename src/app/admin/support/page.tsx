'use client'

import { useState, useEffect } from 'react'
import { Search, MessageSquare, Send, Loader2, Filter } from 'lucide-react'

interface Ticket {
  id: string
  user_email: string
  user_name: string
  category: string
  subject: string
  description: string
  status: string
  priority: string
  order_id: string
  bot_handled: boolean
  created_at: string
  updated_at: string
}

interface TicketMessage {
  id: string
  sender: string
  message: string
  created_at: string
}

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-800' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-600' },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
}

const categoryLabels: Record<string, string> = {
  order_issue: '📦 Order Issue',
  delivery: '🚚 Delivery',
  return: '🔄 Return / Refund',
  payment: '💳 Payment',
  product: '👕 Product',
  other: '💬 Other',
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/support?status=${statusFilter}&search=${search}`)
      const data = await res.json()
      setTickets(data.tickets || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchTickets()
  }, [statusFilter])

  const fetchTicketMessages = async (ticketId: string) => {
    setSelectedTicket(ticketId)
    try {
      const res = await fetch(`/api/admin/support/${ticketId}`)
      const data = await res.json()
      setTicketMessages(data.messages || [])
    } catch {}
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedTicket || sendingMessage) return

    setSendingMessage(true)
    try {
      const res = await fetch('/api/admin/support/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket,
          message: newMessage.trim(),
        }),
      })
      if (res.ok) {
        setNewMessage('')
        fetchTicketMessages(selectedTicket)
        fetchTickets()
      }
    } catch {}
    setSendingMessage(false)
  }

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/support/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          message: `Status updated to ${newStatus}`,
          status: newStatus,
        }),
      })
      if (res.ok) {
        fetchTickets()
        if (selectedTicket === ticketId) {
          fetchTicketMessages(ticketId)
        }
      }
    } catch {}
  }

  const filtered = tickets.filter((t) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      t.subject.toLowerCase().includes(s) ||
      t.user_email.toLowerCase().includes(s) ||
      t.user_name?.toLowerCase().includes(s) ||
      t.id.toLowerCase().includes(s)
    )
  })

  const statusCounts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    in_progress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
  }

  const selectedTicketData = tickets.find((t) => t.id === selectedTicket)

  return (
    <div>
      <h1 className="text-2xl font-display font-medium mb-8">Support Tickets</h1>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {Object.entries(statusCounts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
              statusFilter === key
                ? 'bg-marvvn-black text-white'
                : 'bg-white border text-marvvn-gray-600 hover:bg-gray-50'
            }`}
          >
            {key === 'all' ? 'All' : statusConfig[key]?.label || key} ({count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-marvvn-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tickets..."
          className="input-field pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className={`${selectedTicket ? 'hidden lg:block' : ''} lg:col-span-1 space-y-2`}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-marvvn-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border p-8 text-center">
              <MessageSquare className="w-8 h-8 text-marvvn-gray-300 mx-auto mb-3" />
              <p className="text-sm text-marvvn-gray-400">No tickets found</p>
            </div>
          ) : (
            filtered.map((ticket) => {
              const status = statusConfig[ticket.status] || statusConfig.open
              const priority = priorityConfig[ticket.priority] || priorityConfig.normal
              return (
                <button
                  key={ticket.id}
                  onClick={() => fetchTicketMessages(ticket.id)}
                  className={`w-full text-left p-4 border rounded-lg transition-all cursor-pointer ${
                    selectedTicket === ticket.id
                      ? 'border-marvvn-black bg-gray-50'
                      : 'border-gray-200 hover:border-marvvn-gray-400 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ticket.subject}</p>
                      <p className="text-xs text-marvvn-gray-400 mt-0.5">
                        {ticket.user_name || ticket.user_email} · #{ticket.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                        {status.label}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priority.color}`}>
                        {priority.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[11px] text-marvvn-gray-400">
                      {categoryLabels[ticket.category] || ticket.category}
                    </span>
                    {ticket.bot_handled && (
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Bot</span>
                    )}
                    {ticket.order_id && (
                      <span className="text-[10px] text-marvvn-gray-400">Order: {ticket.order_id.slice(0, 8)}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-marvvn-gray-400 mt-1">
                    {new Date(ticket.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </button>
              )
            })
          )}
        </div>

        {/* Ticket Detail */}
        <div className={`${selectedTicket ? '' : 'hidden lg:block'} lg:col-span-2`}>
          {selectedTicket && selectedTicketData ? (
            <div className="bg-white border h-[600px] flex flex-col">
              {/* Ticket Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedTicket(null)}
                        className="lg:hidden text-marvvn-gray-400 hover:text-marvvn-black cursor-pointer"
                      >
                        ← Back
                      </button>
                      <h3 className="font-medium">{selectedTicketData.subject}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-marvvn-gray-400 mt-1">
                      <span>#{selectedTicketData.id.slice(0, 8).toUpperCase()}</span>
                      <span>{selectedTicketData.user_name || selectedTicketData.user_email}</span>
                      <span>{categoryLabels[selectedTicketData.category]}</span>
                    </div>
                  </div>
                  <select
                    value={selectedTicketData.status}
                    onChange={(e) => handleStatusChange(selectedTicketData.id, e.target.value)}
                    className="text-xs px-3 py-1.5 border rounded-lg cursor-pointer"
                  >
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                {selectedTicketData.order_id && (
                  <p className="text-xs text-marvvn-gray-400 mt-2">
                    Order ID: <span className="font-mono">{selectedTicketData.order_id}</span>
                  </p>
                )}
                <p className="text-xs text-marvvn-gray-500 mt-1">{selectedTicketData.description}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {ticketMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                        msg.sender === 'admin'
                          ? 'bg-marvvn-black text-white rounded-br-md'
                          : msg.sender === 'bot'
                          ? 'bg-purple-50 text-purple-900 rounded-bl-md border border-purple-200'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md border'
                      }`}
                    >
                      <p className={`text-[10px] font-medium mb-0.5 ${
                        msg.sender === 'admin' ? 'text-white/60' : msg.sender === 'bot' ? 'text-purple-500' : 'text-gray-500'
                      }`}>
                        {msg.sender === 'admin' ? 'You (Support)' : msg.sender === 'bot' ? 'Bot Assistant' : msg.sender}
                      </p>
                      <p className="whitespace-pre-line">{msg.message}</p>
                      <p className={`text-[10px] mt-1 ${
                        msg.sender === 'admin' ? 'text-white/40' : 'text-gray-400'
                      }`}>
                        {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              <form onSubmit={handleSendReply} className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 input-field text-sm"
                    disabled={sendingMessage}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sendingMessage}
                    className="btn-primary px-4 py-2 flex items-center gap-1 text-sm cursor-pointer disabled:opacity-50"
                  >
                    {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Reply
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white border p-12 text-center h-[600px] flex flex-col items-center justify-center">
              <MessageSquare className="w-12 h-12 text-marvvn-gray-200 mb-4" />
              <p className="text-marvvn-gray-400">Select a ticket to view the conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
