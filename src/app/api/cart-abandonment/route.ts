import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email, items, total } = await req.json()

  if (!email || !items?.length) {
    return NextResponse.json({ error: 'Email and items are required' }, { status: 400 })
  }

  // Store cart abandonment record
  await supabase.from('cart_abandonment').insert({
    user_id: user.id,
    email,
    items,
    total,
    status: 'pending',
  })

  // Schedule reminder email via cron (1 hour delay handled by external cron or Vercel cron)
  // For now, send immediately if cron is not set up
  try {
    const { sendCartAbandonmentEmail } = await import('@/lib/email')
    await sendCartAbandonmentEmail(email, items, total)
  } catch (e) {
    console.error('Failed to send cart abandonment email:', e)
  }

  return NextResponse.json({ success: true })
}
