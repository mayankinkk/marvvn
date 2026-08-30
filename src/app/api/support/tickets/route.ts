import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ tickets: [] })
  }

  const { data: tickets, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tickets })
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const body = await request.json()
  const { category, subject, description, orderId } = body

  if (!category || !subject || !description) {
    return NextResponse.json({ error: 'Category, subject, and description are required' }, { status: 400 })
  }

  const userEmail = user?.email || body.email || ''
  const userName = user?.user_metadata?.name || body.name || ''

  // Use admin client to bypass RLS for inserts
  const admin = createAdminClient()

  const { data: ticket, error: ticketError } = await admin
    .from('support_tickets')
    .insert({
      user_id: user?.id || null,
      user_email: userEmail,
      user_name: userName,
      category,
      subject,
      description,
      order_id: orderId || null,
      status: 'open',
      priority: category === 'payment' ? 'urgent' : category === 'order_issue' ? 'high' : 'normal',
      bot_handled: false,
    })
    .select()
    .single()

  if (ticketError) {
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }

  // Add initial message from user
  await admin.from('ticket_messages').insert({
    ticket_id: ticket.id,
    sender: 'user',
    message: description,
  })

  return NextResponse.json({ ticket }, { status: 201 })
}
