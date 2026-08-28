import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()

  const body = await request.json()
  const { email } = body

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email: email.toLowerCase().trim(), subscribed_at: new Date().toISOString() }, { onConflict: 'email' })

  if (error) {
    if (error.code === '42P01') {
      return NextResponse.json({ success: true, message: 'Thank you for subscribing!' })
    }
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Thank you for subscribing!' })
}
