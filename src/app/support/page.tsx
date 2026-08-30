'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronRight, Plus, MessageSquare, Clock, CheckCircle, XCircle, Send, Loader2 } from 'lucide-react'

interface Ticket {
  id: string
  category: string
  subject: string
  description: string
  status: string
  priority: string
  created_at: string
  updated_at: string
}

interface TicketMessage {
  id: string
  sender: string
  message: string
  created_at: string
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-800', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-800', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-600', icon: XCircle },
}

const priorityColors: Record<string, string> = {
  low: 'text-gray-500',
  normal: 'text-blue-600',
  high: 'text-orange-600',
  urgent: 'text-red-600 font-bold',
}

const categoryLabels: Record<string, string> = {
  order_issue: '📦 Order Issue',
  delivery: '🚚 Delivery',
  return: '🔄 Return / Refund',
  payment: '💳 Payment',
  product: '👕 Product',
  other: '💬 Other',
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)

  const [newTicket, setNewTicket] = useState({
    category: 'order_issue',
    subject: '',
    description: '',
    orderId: '',
  })

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/support/tickets')
      const data = await res.json()
      setTickets(data.tickets || [])
    } catch {}
    setLoading(false)
  }

  const fetchTicketMessages = async (ticketId: string) => {
    setSelectedTicket(ticketId)
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`)
      const data = await res.json()
      setTicketMessages(data.messages || [])
    } catch {}
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTicket.subject || !newTicket.description) return

    setCreating(true)
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      })
      if (res.ok) {
        setShowCreateForm(false)
        setNewTicket({ category: 'order_issue', subject: '', description: '', orderId: '' })
        fetchTickets()
      }
    } catch {}
    setCreating(false)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedTicket || sendingMessage) return

    setSendingMessage(true)
    try {
      const res = await fetch('/api/support/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: selectedTicket, message: newMessage.trim() }),
      })
      if (res.ok) {
        setNewMessage('')
        fetchTicketMessages(selectedTicket)
      }
    } catch {}
    setSendingMessage(false)
  }

  const selectedTicketData = tickets.find((t) => t.id === selectedTicket)

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-16">
        <nav className="flex items-center gap-2 text-xs text-marvvn-gray-500 mb-8">
          <Link href="/" className="hover:text-marvvn-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-marvvn-black">Support</span>
        </nav>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-display font-medium">Support Center</h1>
              <p className="text-sm text-marvvn-gray-500 mt-1">Get help with your orders, returns, and more</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center gap-2 text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Ticket
            </button>
          </div>

          {/* Create Ticket Form */}
          {showCreateForm && (
            <div className="bg-white border p-6 mb-8">
              <h2 className="font-medium text-lg mb-4">Create Support Ticket</h2>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                      className="input-field w-full"
                    >
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Order ID (optional)</label>
                    <input
                      type="text"
                      value={newTicket.orderId}
                      onChange={(e) => setNewTicket({ ...newTicket, orderId: e.target.value })}
                      placeholder="e.g. abc12345"
                      className="input-field w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input
                    type="text"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    placeholder="Brief summary of your issue"
                    className="input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    placeholder="Describe your issue in detail..."
                    rows={4}
                    className="input-field w-full resize-none"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={creating} className="btn-primary px-6 py-2 text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50">
                    {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                    {creating ? 'Creating...' : 'Create Ticket'}
                  </button>
                  <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary px-6 py-2 text-sm cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ticket List */}
            <div className={`${selectedTicket ? 'hidden lg:block' : ''} lg:col-span-1`}>
              <h2 className="font-medium text-sm text-marvvn-gray-400 uppercase tracking-wider mb-3">
                Your Tickets ({tickets.length})
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-marvvn-gray-400" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="bg-white border p-8 text-center">
                  <MessageSquare className="w-8 h-8 text-marvvn-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-marvvn-gray-400">No tickets yet</p>
                  <p className="text-xs text-marvvn-gray-400 mt-1">Create a ticket to get help from our team</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tickets.map((ticket) => {
                    const status = statusConfig[ticket.status] || statusConfig.open
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
                              #{ticket.id.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[11px] text-marvvn-gray-400">
                            {categoryLabels[ticket.category] || ticket.category}
                          </span>
                          <span className={`text-[11px] ${priorityColors[ticket.priority] || ''}`}>
                            {ticket.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-marvvn-gray-400 mt-1">
                          {new Date(ticket.updated_at || ticket.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Ticket Detail / Messages */}
            <div className={`${selectedTicket ? '' : 'hidden lg:block'} lg:col-span-2`}>
              {selectedTicket && selectedTicketData ? (
                <div className="bg-white border h-[500px] flex flex-col">
                  {/* Ticket Header */}
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        onClick={() => setSelectedTicket(null)}
                        className="lg:hidden text-marvvn-gray-400 hover:text-marvvn-black cursor-pointer"
                      >
                        ← Back
                      </button>
                      <h3 className="font-medium">{selectedTicketData.subject}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-marvvn-gray-400">
                      <span>#{selectedTicketData.id.slice(0, 8).toUpperCase()}</span>
                      <span>{categoryLabels[selectedTicketData.category]}</span>
                      <span className={priorityColors[selectedTicketData.priority]}>
                        {selectedTicketData.priority}
                      </span>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {ticketMessages.length === 0 && (
                      <p className="text-center text-sm text-marvvn-gray-400 py-8">No messages yet</p>
                    )}
                    {ticketMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                            msg.sender === 'user'
                              ? 'bg-marvvn-black text-white rounded-br-md'
                              : msg.sender === 'bot'
                              ? 'bg-gray-100 text-gray-700 rounded-bl-md border'
                              : 'bg-blue-50 text-blue-900 rounded-bl-md border border-blue-200'
                          }`}
                        >
                          {msg.sender === 'admin' && (
                            <p className="text-[10px] font-medium text-blue-600 mb-0.5">Support Team</p>
                          )}
                          {msg.sender === 'bot' && (
                            <p className="text-[10px] font-medium text-gray-500 mb-0.5">Bot Assistant</p>
                          )}
                          <p className="whitespace-pre-line">{msg.message}</p>
                          <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-white/50' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input */}
                  {selectedTicketData.status !== 'closed' && (
                    <form onSubmit={handleSendMessage} className="p-4 border-t">
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
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="bg-white border p-12 text-center h-[500px] flex flex-col items-center justify-center">
                  <MessageSquare className="w-12 h-12 text-marvvn-gray-200 mb-4" />
                  <p className="text-marvvn-gray-400">Select a ticket to view the conversation</p>
                  <p className="text-xs text-marvvn-gray-400 mt-1">or create a new ticket to get help</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
