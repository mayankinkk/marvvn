import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: ticket, error } = await admin
    .from('support_tickets')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  const { data: messages } = await admin
    .from('ticket_messages')
    .select('*')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true })

  return NextResponse.json({ ticket, messages: messages || [] })
}
