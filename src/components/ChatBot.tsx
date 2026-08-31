'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2, Headphones } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
  actions?: { label: string; action: string; payload?: any }[]
}

const SUPPORT_CATEGORIES = [
  { key: 'order_issue', label: '📦 Order Issue', description: 'Wrong item, damaged, missing' },
  { key: 'delivery', label: '🚚 Delivery Problem', description: 'Late, not delivered' },
  { key: 'return', label: '🔄 Return / Refund', description: 'Return request, refund' },
  { key: 'payment', label: '💳 Payment Issue', description: 'Failed payment, charged twice' },
  { key: 'product', label: '👕 Product Question', description: 'Size, availability' },
  { key: 'other', label: '💬 Other', description: 'Anything else' },
]

const QUICK_REPLIES = [
  { label: '📦 Track my order', message: 'I want to track my order' },
  { label: '🔄 Return policy', message: 'What is the return policy?' },
  { label: '📏 Size guide', message: 'What size should I get?' },
  { label: '🛠️ Get support', message: 'I need help with an issue' },
]

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      text: "Hey! 👋 I'm MARVVN's support assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [ticketMode, setTicketMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const addBotMessage = (text: string, actions?: Message['actions']) => {
    const msg: Message = {
      id: Date.now().toString() + Math.random(),
      role: 'assistant',
      text,
      timestamp: new Date(),
      actions,
    }
    setMessages((prev) => [...prev, msg])
  }

  const sendSupportChat = async (text: string) => {
    setIsLoading(true)
    try {
      const chatHistory = messages.map((m) => ({ role: m.role, text: m.text }))

      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatHistory,
          intent: ticketMode ? 'create_ticket' : undefined,
          category: selectedCategory || undefined,
        }),
      })

      const data = await res.json()

      let cleanReply = data.reply || "I'm here to help! How can I assist you today?"
      if (typeof cleanReply === 'string' && (cleanReply.trim().startsWith('{') || cleanReply.includes('"action":'))) {
        try {
          const p = JSON.parse(cleanReply)
          if (p.reply) cleanReply = p.reply
        } catch {
          const m = cleanReply.match(/"reply"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/)
          if (m && m[1]) {
            cleanReply = m[1].replace(/\\"/g, '"')
          } else {
            cleanReply = "I'm here to help! How can I assist you today?"
          }
        }
      }

      const actions = data.action === 'ask_category' || data.action === 'none'
        ? [{ label: '🛠️ Talk to support', action: 'show_categories' }]
        : undefined

      addBotMessage(cleanReply, actions)

      if (data.action === 'ask_order_id') {
        setTicketMode(false)
      }
    } catch {
      addBotMessage("Connection error. Please try again or WhatsApp us at +91 7578017237 📱")
    }
    setIsLoading(false)
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setShowCategories(false)

    // If we're in ticket creation mode with a category selected, create the ticket
    if (ticketMode && selectedCategory) {
      setIsLoading(true)
      try {
        const res = await fetch('/api/support/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            intent: 'create_ticket',
            category: selectedCategory,
          }),
        })
        const data = await res.json()
        addBotMessage(data.reply)
        setTicketMode(false)
        setSelectedCategory(null)
      } catch {
        addBotMessage("Failed to create ticket. Please WhatsApp us at +91 7578017237 📱")
      }
      setIsLoading(false)
      return
    }

    await sendSupportChat(text.trim())
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setTicketMode(true)

    const cat = SUPPORT_CATEGORIES.find((c) => c.key === category)
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: cat?.label || category,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])

    addBotMessage(
      `Got it — I'll help you with a **${cat?.label.replace(/^[^\s]+ /, '')}** issue.\n\nPlease describe the problem in detail. If you have an Order ID, include it too. I'll create a ticket and our team will respond within 24 hours.`
    )
    setShowCategories(false)
  }

  const handleAction = (action: string) => {
    if (action === 'show_categories') {
      setShowCategories(true)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 cursor-pointer ${
          isOpen
            ? 'bg-marvvn-black rotate-0'
            : 'bg-marvvn-black hover:scale-110 hover:shadow-xl'
        }`}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Headphones className="w-6 h-6 text-white" />
        )}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ height: '560px' }}>
          {/* Header */}
          <div className="bg-marvvn-black text-white px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-sm tracking-wide">MARVVN Support</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-[11px] text-white/60">Bot + Human Support</span>
              </div>
            </div>
            <button
              onClick={() => { setShowCategories(true) }}
              className="text-[11px] px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            >
              🛠️ Support
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 bg-marvvn-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-marvvn-black text-white rounded-br-md'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 text-gray-600" />
                    </div>
                  )}
                </div>
                {/* Action buttons */}
                {msg.actions && msg.role === 'assistant' && (
                  <div className="flex gap-2 mt-2 ml-9">
                    {msg.actions.map((a, i) => (
                      <button
                        key={i}
                        onClick={() => handleAction(a.action)}
                        className="text-[11px] px-3 py-1.5 rounded-full border border-marvvn-black text-marvvn-black hover:bg-marvvn-black hover:text-white transition-colors cursor-pointer"
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Category Picker */}
            {showCategories && (
              <div className="ml-9 space-y-1.5">
                <p className="text-[11px] text-gray-400 mb-2">Select your issue:</p>
                {SUPPORT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => handleCategorySelect(cat.key)}
                    className="w-full text-left px-3 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-marvvn-black hover:bg-gray-50 transition-all text-[12px] cursor-pointer"
                  >
                    <span className="font-medium">{cat.label}</span>
                    <span className="text-gray-400 ml-1">— {cat.description}</span>
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 bg-marvvn-black rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && !showCategories && (
            <div className="px-4 py-2 border-t border-gray-100 bg-white flex gap-2 flex-wrap">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply.label}
                  onClick={() => sendMessage(reply.message)}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-marvvn-black hover:text-white hover:border-marvvn-black transition-colors cursor-pointer whitespace-nowrap"
                >
                  {reply.label}
                </button>
              ))}
            </div>
          )}

          {/* Ticket mode indicator */}
          {ticketMode && selectedCategory && (
            <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-[11px] text-amber-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              Creating ticket for: {SUPPORT_CATEGORIES.find(c => c.key === selectedCategory)?.label}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={ticketMode ? 'Describe your issue...' : 'Type a message...'}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-[13px] focus:outline-none focus:border-marvvn-black transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 bg-marvvn-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-30 cursor-pointer flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
