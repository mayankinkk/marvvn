import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { email, items, total, phone } = await req.json()

  if (!email || !items?.length) {
    return NextResponse.json({ error: 'Email and items are required' }, { status: 400 })
  }

  if (user) {
    await supabase.from('cart_abandonment').insert({
      user_id: user.id,
      email,
      items,
      total,
      status: 'pending',
    })
  }

  // Send email
  try {
    const { sendCartAbandonmentEmail } = await import('@/lib/email')
    await sendCartAbandonmentEmail(email, items, total)
  } catch (e) {
    console.error('Failed to send cart abandonment email:', e)
  }

  // Send WhatsApp if phone available
  if (phone) {
    try {
      const { sendWhatsAppCartAbandonment } = await import('@/lib/whatsapp')
      await sendWhatsAppCartAbandonment(phone, items, total)
    } catch (e) {
      console.error('Failed to send cart abandonment WhatsApp:', e)
    }
  }

  return NextResponse.json({ success: true })
}
