import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  }

  const ticketRes = await fetch(`${supabaseUrl}/rest/v1/support_tickets?id=eq.${id}&select=*`, { headers })
  const tickets = await ticketRes.json()

  if (!tickets || tickets.length === 0) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  const messagesRes = await fetch(`${supabaseUrl}/rest/v1/ticket_messages?ticket_id=eq.${id}&select=*&order=created_at.asc`, { headers })
  const messages = await messagesRes.json()

  return NextResponse.json({ ticket: tickets[0], messages: messages || [] })
}
