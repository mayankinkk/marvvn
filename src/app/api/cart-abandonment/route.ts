import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { email, items, total, phone } = await req.json()

  if (!email || !items?.length) {
    return NextResponse.json({ error: 'Email and items are required' }, { status: 400 })
  }

  // Track for ALL users (guest + logged-in) — use admin client to bypass RLS
  try {
    const admin = createAdminClient()
    // Avoid duplicate pending rows for same email within 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: existing } = await admin
      .from('cart_abandonment')
      .select('id')
      .eq('email', email)
      .eq('status', 'pending')
      .gte('created_at', oneHourAgo)
      .limit(1)
      .maybeSingle()

    if (!existing) {
      await admin.from('cart_abandonment').insert({
        user_id: user?.id || null,
        email,
        items,
        total,
        status: 'pending',
      })
    } else {
      // Update existing pending row with latest cart
      await admin.from('cart_abandonment').update({ items, total, updated_at: new Date().toISOString() }).eq('id', existing.id)
    }
  } catch (e) {
    console.error('Failed to track abandoned cart:', e)
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
