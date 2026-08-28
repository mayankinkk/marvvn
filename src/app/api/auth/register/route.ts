import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: Request) {
  const { name, email, password } = await request.json()

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').upsert(
      { id: data.user.id, name, email },
      { onConflict: 'id' }
    )
    if (profileError) {
      console.error('Profile upsert error:', profileError)
    }

    sendWelcomeEmail(email, name).catch(console.error)
  }

  return NextResponse.json({ user: data.user }, { status: 201 })
}
