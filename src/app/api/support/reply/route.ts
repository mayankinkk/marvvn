import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { ticketId, message } = await request.json()

  if (!ticketId || !message) {
    return NextResponse.json({ error: 'Ticket ID and message are required' }, { status: 400 })
  }

  // Verify the ticket belongs to the user
  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('id, status')
    .eq('id', ticketId)
    .eq('user_id', user.id)
    .single()

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  if (ticket.status === 'closed') {
    return NextResponse.json({ error: 'This ticket is closed' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Add the message
  const { error: msgError } = await admin.from('ticket_messages').insert({
    ticket_id: ticketId,
    sender: 'user',
    message,
  })

  if (msgError) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  // Update ticket status back to open if it was resolved
  if (ticket.status === 'resolved') {
    await admin
      .from('support_tickets')
      .update({ status: 'open', updated_at: new Date().toISOString() })
      .eq('id', ticketId)
  }

  return NextResponse.json({ success: true })
}
