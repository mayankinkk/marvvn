import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing env vars', tickets: [] })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  let restUrl = `${supabaseUrl}/rest/v1/support_tickets?select=*&order=created_at.desc`

  if (status && status !== 'all') {
    restUrl += `&status=eq.${status}`
  }

  const res = await fetch(restUrl, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const errText = await res.text()
    return NextResponse.json({ error: errText, tickets: [] })
  }

  let tickets = await res.json()

  if (search) {
    const s = search.toLowerCase()
    tickets = tickets.filter((t: any) =>
      t.subject.toLowerCase().includes(s) ||
      t.user_email.toLowerCase().includes(s) ||
      t.user_name?.toLowerCase().includes(s) ||
      t.id.toLowerCase().includes(s)
    )
  }

  return NextResponse.json({ tickets })
}
