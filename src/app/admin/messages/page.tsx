'use client'

import { useState, useEffect } from 'react'
import { Search, Mail, User, Trash2, Eye, EyeOff, MessageSquare } from 'lucide-react'

interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Message | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  async function fetchMessages() {
    const res = await fetch('/api/admin/messages')
    const data = await res.json()
    setMessages(data.messages || [])
    setLoading(false)
  }

  async function markAsRead(id: string) {
    await fetch('/api/admin/messages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_read: true } : m))
    )
    if (selected?.id === id) setSelected({ ...selected, is_read: true })
  }

  async function deleteMessage(id: string) {
    if (!confirm('Delete this message?')) return
    await fetch('/api/admin/messages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setMessages((prev) => prev.filter((m) => m.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const filtered = messages.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.subject?.toLowerCase().includes(search.toLowerCase())
  )

  const unreadCount = messages.filter((m) => !m.is_read).length

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
          <h1 className="text-2xl font-display font-medium">Messages</h1>
          <p className="text-sm text-marvvn-gray-500 mt-1">
            {messages.length} total{unreadCount > 0 && ` · ${unreadCount} unread`}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-marvvn-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or subject..."
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Message List */}
        <div className={`${selected ? 'hidden lg:block lg:w-1/2' : 'w-full'} bg-white border rounded-xl overflow-hidden`}>
          <div className="overflow-y-auto max-h-[600px]">
            {filtered.length === 0 ? (
              <div className="px-6 py-12 text-center text-marvvn-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-marvvn-gray-300" />
                No messages found
              </div>
            ) : (
              filtered.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => { setSelected(msg); markAsRead(msg.id) }}
                  className={`px-6 py-4 border-b last:border-0 cursor-pointer transition-colors ${
                    selected?.id === msg.id
                      ? 'bg-marvvn-gray-50'
                      : msg.is_read
                      ? 'hover:bg-marvvn-gray-50'
                      : 'bg-blue-50/50 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-marvvn-black to-marvvn-gray-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {msg.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{msg.name}</p>
                          {!msg.is_read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-marvvn-gray-400 truncate">{msg.subject}</p>
                      </div>
                    </div>
                    <span className="text-xs text-marvvn-gray-400 flex-shrink-0 ml-2">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className={`${selected ? 'w-full lg:w-1/2' : 'hidden'} bg-white border rounded-xl p-6`}>
          {selected ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-display font-medium">{selected.subject}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteMessage(selected.id)}
                    className="p-2 text-marvvn-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-2 text-marvvn-gray-400 hover:text-marvvn-gray-600 hover:bg-marvvn-gray-50 rounded-lg transition-colors cursor-pointer lg:hidden"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-marvvn-black to-marvvn-gray-700 flex items-center justify-center text-white font-bold">
                  {selected.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-medium">{selected.name}</p>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" />
                    {selected.email}
                  </a>
                </div>
              </div>

              <div className="text-sm text-marvvn-gray-700 whitespace-pre-wrap leading-relaxed">
                {selected.message}
              </div>

              <p className="text-xs text-marvvn-gray-400 mt-6">
                Received {new Date(selected.created_at).toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-marvvn-gray-400">
              Select a message to view
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
