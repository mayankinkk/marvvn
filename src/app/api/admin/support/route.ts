import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const admin = createAdminClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  let query = admin
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: tickets, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message, tickets: [] })
  }

  let filtered = tickets || []

  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter((t: any) =>
      t.subject.toLowerCase().includes(s) ||
      t.user_email.toLowerCase().includes(s) ||
      t.user_name?.toLowerCase().includes(s) ||
      t.id.toLowerCase().includes(s)
    )
  }

  return NextResponse.json({ tickets: filtered })
}
