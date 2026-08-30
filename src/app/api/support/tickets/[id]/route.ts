import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  const { data: messages } = await supabase
    .from('ticket_messages')
    .select('*')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true })

  return NextResponse.json({ ticket, messages: messages || [] })
}
