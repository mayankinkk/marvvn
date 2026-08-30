import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const SUPPORT_CATEGORIES = [
  { key: 'order_issue', label: '📦 Order Issue', description: 'Wrong item, damaged, missing items' },
  { key: 'delivery', label: '🚚 Delivery Problem', description: 'Late delivery, wrong address, not delivered' },
  { key: 'return', label: '🔄 Return / Refund', description: 'Return request, refund status' },
  { key: 'payment', label: '💳 Payment Issue', description: 'Failed payment, double charged, COD issues' },
  { key: 'product', label: '👕 Product Question', description: 'Size, availability, product details' },
  { key: 'other', label: '💬 Other', description: 'Anything else' },
]

const CATEGORIES_JSON = JSON.stringify(SUPPORT_CATEGORIES)

export async function POST(request: Request) {
  try {
    const { message, history = [], intent, orderId, category } = await request.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        reply: 'Support system is not configured yet. Please WhatsApp us at +91 7578017237 📱',
        action: 'none',
      })
    }

    // Handle category selection — create ticket directly
    if (intent === 'create_ticket' && category) {
      return await handleCreateTicket(category, message, orderId)
    }

    // Handle order tracking intent
    if (intent === 'track_order') {
      return await handleOrderTracking(message, orderId)
    }

    // Handle cancel order intent
    if (intent === 'cancel_order') {
      return await handleCancelOrder(message, orderId)
    }

    // AI-powered auto-resolution for general messages
    const admin = createAdminClient()

    // Try to detect if this is a support request that needs a ticket
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      systemInstruction: `You are MARVVN's smart support system. Analyze the customer's message and decide what action to take.

ACTIONS YOU CAN TAKE:
1. "track_order" — if they want to track an order (need order ID)
2. "cancel_order" — if they want to cancel an order (need order ID)
3. "create_ticket" — if they have a problem that needs human help
4. "auto_reply" — if you can answer directly without a ticket
5. "ask_category" — if they have an issue but category is unclear
6. "none" — general conversation

CATEGORIES for tickets:
${CATEGORIES_JSON}

RULES:
- For simple questions (return policy, size guide, shipping info) → auto_reply
- For order tracking → ask for order ID, then track_order
- For complaints, wrong items, payment issues → create_ticket
- For "talk to someone" or "human agent" → ask_category then create_ticket
- If unsure → ask_category

Respond in JSON format:
{"action": "track_order|cancel_order|create_ticket|auto_reply|ask_category|none", "category": "order_issue|delivery|return|payment|product|other", "reply": "your message to the customer", "subject": "ticket subject if creating ticket"}

IMPORTANT: Always respond with valid JSON only, no markdown, no code blocks.`,
    })

    const chatHistory = history.slice().filter((m: any) => m.role === 'user' || m.role === 'assistant').map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }))

    // Drop leading non-user messages
    while (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
      chatHistory.shift()
    }

    const chat = model.startChat({
      history: chatHistory.slice(-10),
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.3,
      },
    })

    const result = await chat.sendMessage(message)
    const responseText = result.response.text()

    let parsed
    try {
      parsed = JSON.parse(responseText.replace(/```json?\n?/g, '').replace(/```/g, '').trim())
    } catch {
      parsed = { action: 'auto_reply', reply: responseText }
    }

    // Auto-create ticket if needed
    if (parsed.action === 'create_ticket' && parsed.category) {
      return await handleSmartTicket(parsed, message)
    }

    return NextResponse.json({
      reply: parsed.reply || "I'm here to help! What can I do for you?",
      action: parsed.action || 'none',
      category: parsed.category || null,
      subject: parsed.subject || null,
    })

  } catch (error: any) {
    console.error('Support chat error:', error?.message)
    return NextResponse.json({
      reply: "I'm having trouble right now. You can:\n\n• WhatsApp us: +91 7578017237\n• Or raise a ticket and our team will get back to you.",
      action: 'none',
    })
  }
}

async function handleOrderTracking(message: string, orderId?: string) {
  const admin = createAdminClient()

  // Extract order ID from message if not provided
  const id = orderId || message.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 36)

  if (!id || id.length < 5) {
    return NextResponse.json({
      reply: "Sure, I can help track your order! Please share your **Order ID** (you can find it in your order confirmation email). It looks like a short code, e.g. `abc12345`.",
      action: 'ask_order_id',
    })
  }

  const { data: order } = await admin
    .from('orders')
    .select('id, status, total, created_at, shipping_address, order_items(quantity, products(title))')
    .eq('id', id)
    .single()

  if (!order) {
    // Try partial match
    const { data: orders } = await admin
      .from('orders')
      .select('id, status, total, created_at, shipping_address, order_items(quantity, products(title))')
      .ilike('id', `%${id}%`)
      .limit(1)

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        reply: `I couldn't find an order with ID "${id}". Please double-check the order ID from your confirmation email. Need more help? I can create a support ticket for you.`,
        action: 'none',
      })
    }

    const foundOrder = orders[0]
    return buildOrderResponse(foundOrder)
  }

  return buildOrderResponse(order)
}

function buildOrderResponse(order: any) {
  const statusEmoji: Record<string, string> = {
    pending: '⏳',
    confirmed: '✅',
    shipped: '🚚',
    delivered: '📦',
    cancelled: '❌',
  }

  const statusMessages: Record<string, string> = {
    pending: 'Your order has been placed and is awaiting confirmation.',
    confirmed: 'Great news! Your order has been confirmed and is being prepared.',
    shipped: 'Your order is on its way! It should arrive within 2-4 business days.',
    delivered: 'Your order has been delivered. We hope you love it!',
    cancelled: 'This order has been cancelled.',
  }

  const items = order.order_items?.map((item: any) =>
    `${item.quantity}x ${item.products?.title || 'Product'}`
  ).join(', ') || 'No items'

  const createdDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const reply = `${statusEmoji[order.status] || '📋'} *Order #${order.id.slice(0, 8).toUpperCase()}*\n\n` +
    `Status: *${order.status.charAt(0).toUpperCase() + order.status.slice(1)}*\n` +
    `${statusMessages[order.status] || 'Status updated.'}\n\n` +
    `Items: ${items}\n` +
    `Total: ₹${order.total?.toLocaleString()}\n` +
    `Placed: ${createdDate}\n\n` +
    `${order.status === 'delivered' ? 'Need help with a return? I can create a return request for you.' : ''}` +
    `${order.status === 'shipped' ? 'Any delivery issues? Let me know and I\'ll help!' : ''}`

  return NextResponse.json({ reply, action: 'none' })
}

async function handleCancelOrder(message: string, orderId?: string) {
  const admin = createAdminClient()
  const id = orderId || message.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 36)

  if (!id || id.length < 5) {
    return NextResponse.json({
      reply: "I can help cancel your order. Please share your **Order ID** from your confirmation email.",
      action: 'ask_order_id',
    })
  }

  const { data: order } = await admin
    .from('orders')
    .select('id, status')
    .eq('id', id)
    .single()

  if (!order) {
    return NextResponse.json({
      reply: `I couldn't find order "${id}". Please check the ID and try again.`,
      action: 'none',
    })
  }

  if (order.status === 'shipped' || order.status === 'delivered') {
    return NextResponse.json({
      reply: `Sorry, order #${order.id.slice(0, 8).toUpperCase()} has already been ${order.status} and can't be cancelled. You can return it after delivery instead. Want me to create a return request?`,
      action: 'none',
    })
  }

  if (order.status === 'cancelled') {
    return NextResponse.json({
      reply: `Order #${order.id.slice(0, 8).toUpperCase()} is already cancelled.`,
      action: 'none',
    })
  }

  // Cancel the order
  await admin
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', order.id)

  return NextResponse.json({
    reply: `Done! Order #${order.id.slice(0, 8).toUpperCase()} has been cancelled. If you paid online, the refund will be processed within 5-7 business days. 🙏`,
    action: 'none',
  })
}

async function handleCreateTicket(category: string, description: string, orderId?: string) {
  const admin = createAdminClient()

  const { data: ticket, error } = await admin
    .from('support_tickets')
    .insert({
      user_email: 'guest@marvvn.online',
      user_name: 'Customer',
      category,
      subject: `${category.replace(/_/g, ' ')} — ${description.slice(0, 50)}`,
      description,
      order_id: orderId || null,
      status: 'open',
      priority: category === 'payment' ? 'urgent' : category === 'order_issue' ? 'high' : 'normal',
      bot_handled: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({
      reply: "Sorry, I couldn't create a ticket right now. Please WhatsApp us at +91 7578017237 for immediate help. 📱",
      action: 'none',
    })
  }

  await admin.from('ticket_messages').insert({
    ticket_id: ticket.id,
    sender: 'user',
    message: description,
  })

  await admin.from('ticket_messages').insert({
    ticket_id: ticket.id,
    sender: 'bot',
    message: `I've created a support ticket for you. Our team will review it and get back to you within 24 hours. You can track the status in your account under "My Support Tickets".`,
  })

  return NextResponse.json({
    reply: `✅ Ticket created! Our team will review your issue and get back to you within 24 hours.\n\nTicket ID: #${ticket.id.slice(0, 8).toUpperCase()}\nCategory: ${category.replace(/_/g, ' ')}\n\nYou can check the status anytime in your account → Support Tickets. Is there anything else I can help with?`,
    action: 'ticket_created',
    ticketId: ticket.id,
  })
}

async function handleSmartTicket(parsed: any, originalMessage: string) {
  const admin = createAdminClient()

  const { data: ticket, error } = await admin
    .from('support_tickets')
    .insert({
      user_email: 'guest@marvvn.online',
      user_name: 'Customer',
      category: parsed.category || 'other',
      subject: parsed.subject || `${parsed.category} — support request`,
      description: originalMessage,
      status: 'open',
      priority: parsed.category === 'payment' ? 'urgent' : parsed.category === 'order_issue' ? 'high' : 'normal',
      bot_handled: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({
      reply: parsed.reply || "I'm having trouble creating a ticket. Please WhatsApp us at +91 7578017237.",
      action: 'none',
    })
  }

  await admin.from('ticket_messages').insert({
    ticket_id: ticket.id,
    sender: 'user',
    message: originalMessage,
  })

  await admin.from('ticket_messages').insert({
    ticket_id: ticket.id,
    sender: 'bot',
    message: 'This issue has been escalated to our support team. They will review and respond within 24 hours.',
  })

  return NextResponse.json({
    reply: `${parsed.reply}\n\nI've created ticket #${ticket.id.slice(0, 8).toUpperCase()} for you. Our team will respond within 24 hours. You can track it in your account → Support Tickets.`,
    action: 'ticket_created',
    ticketId: ticket.id,
  })
}
