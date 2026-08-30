import { createClient } from '@/lib/supabase/server'

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0'
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN

export async function sendWhatsAppOrderNotification(order: {
  id: string
  total: number
  items: { title: string; quantity: number; size?: string }[]
  customerName: string
  customerPhone: string
}) {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN || !order.customerPhone) return

  const itemsList = order.items.map(i => `${i.quantity}x ${i.title}${i.size ? ` (${i.size})` : ''}`).join('\n')

  const message = `🎉 *New Order Received!*

*Order:* #${order.id.slice(0, 8).toUpperCase()}
*Customer:* ${order.customerName}
*Phone:* ${order.customerPhone}

*Items:*
${itemsList}

*Total:* ₹${order.total.toLocaleString()}

View in admin panel: https://marvvn.online/admin/orders`

  try {
    await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: process.env.ADMIN_WHATSAPP_NUMBER,
        type: 'text',
        text: { body: message },
      }),
    })
  } catch (error) {
    console.error('WhatsApp notification failed:', error)
  }
}

export async function sendWhatsAppOrderStatusUpdate(phone: string, orderId: string, status: string) {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN || !phone) return

  const statusMessages: Record<string, string> = {
    confirmed: '✅ Your order has been confirmed and is being prepared.',
    shipped: '📦 Your order has been shipped! It will arrive soon.',
    delivered: '🎉 Your order has been delivered. We hope you love it!',
    cancelled: '❌ Your order has been cancelled.',
  }

  const message = `*MARVVN*\n\n${statusMessages[status] || 'Your order status has been updated.'}\n\nOrder: #${orderId.slice(0, 8).toUpperCase()}`

  try {
    await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: message },
      }),
    })
  } catch (error) {
    console.error('WhatsApp status update failed:', error)
  }
}

export async function sendWhatsAppCartAbandonment(phone: string, items: { title: string; quantity: number }[], total: number) {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN || !phone) return

  const itemsList = items.map(i => `${i.quantity}x ${i.title}`).join('\n')

  const message = `🛒 *Hey, you left something behind!*

${itemsList}

Total: ₹${total.toLocaleString()}

Complete your order before it sells out:
https://marvvn.online/cart`

  try {
    await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: message },
      }),
    })
  } catch (error) {
    console.error('WhatsApp cart abandonment failed:', error)
  }
}

export async function sendWhatsAppMessage(phone: string, message: string) {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN || !phone) return

  const res = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: { body: message },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || 'WhatsApp send failed')
  }
}
