import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function isAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin || false
}

// GET: list campaigns
export async function GET(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  let query = supabase.from('whatsapp_campaigns').select('*').order('created_at', { ascending: false }).limit(50)
  if (type) query = query.eq('type', type)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ campaigns: data })
}

// POST: send a campaign
export async function POST(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { type, title, message, productId } = body

  if (!type || !title || !message) {
    return NextResponse.json({ error: 'Type, title, and message are required' }, { status: 400 })
  }

  // Create campaign record
  const { data: campaign, error: createError } = await supabase
    .from('whatsapp_campaigns')
    .insert({
      type,
      title,
      message,
      product_id: productId || null,
      status: 'sending',
    })
    .select()
    .single()

  if (createError) return NextResponse.json({ error: createError.message }, { status: 500 })

  // Get recipients based on type
  let recipients: { phone: string; email: string }[] = []

  if (type === 'new_arrival') {
    // Send to all customers who have placed at least one order
    const { data: orders } = await supabase
      .from('orders')
      .select('shipping_address')

    const phoneSet = new Set<string>()
    orders?.forEach((o: any) => {
      const phone = o.shipping_address?.phone
      if (phone) phoneSet.add(phone)
    })
    recipients = Array.from(phoneSet).map(phone => ({ phone, email: '' }))
  } else if (type === 'abandoned_cart') {
    // Send to pending abandoned carts
    const { data: carts } = await supabase
      .from('cart_abandonment')
      .select('email, notes')
      .eq('status', 'pending')

    // Extract phone from notes or try to find from orders
    if (carts) {
      for (const cart of carts) {
        // Try to find phone from previous orders
        const { data: order } = await supabase
          .from('orders')
          .select('shipping_address')
          .eq('shipping_address->>email', cart.email)
          .limit(1)
          .single()

        const phone = order?.shipping_address?.phone
        if (phone) {
          recipients.push({ phone, email: cart.email })
        }
      }
    }
  }

  // Send WhatsApp messages
  const { sendWhatsAppMessage } = await import('@/lib/whatsapp')
  let sentCount = 0
  let failedCount = 0

  for (const recipient of recipients) {
    try {
      await sendWhatsAppMessage(recipient.phone, message)
      sentCount++
    } catch {
      failedCount++
    }
  }

  // Update campaign status
  await supabase
    .from('whatsapp_campaigns')
    .update({
      status: sentCount > 0 ? 'sent' : 'failed',
      recipient_count: recipients.length,
      sent_count: sentCount,
      failed_count: failedCount,
      sent_at: new Date().toISOString(),
    })
    .eq('id', campaign.id)

  return NextResponse.json({
    success: true,
    campaign: { ...campaign, recipient_count: recipients.length, sent_count: sentCount, failed_count: failedCount },
  })
}
