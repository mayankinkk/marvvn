import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const body = await request.json()
  const { id, email, full_name } = body

  if (!id || !email) {
    return NextResponse.json({ error: 'Missing id or email' }, { status: 400 })
  }

  const { error } = await supabase.from('profiles').upsert({
    id,
    name: full_name || email.split('@')[0],
  }, { onConflict: 'id' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
