import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rl = await rateLimit(`contact:${ip}`, 5, 60000)
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const supabase = createAdminClient()

  const body = await request.json()
  const { name, email, subject, message } = body

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('contact_messages')
    .insert({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      message: message.trim(),
    })

  if (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Message received! We\'ll get back to you soon.' })
}
