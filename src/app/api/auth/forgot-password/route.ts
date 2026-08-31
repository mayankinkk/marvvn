import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const supabase = createClient()
  const origin = request.headers.get('origin') || 'https://marvvn.online'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/account/reset-password`,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
