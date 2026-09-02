import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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
    options: {
      data: { name },
      emailRedirectTo: `${request.headers.get('origin') || 'https://marvvn.online'}/account`,
    },
  })

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already exists')) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (data.user) {
    const identities = data.user.identities || []
    if (identities.length === 0) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error: profileError } = await admin.from('profiles').upsert(
      { id: data.user.id, name, email },
      { onConflict: 'id' }
    )
    if (profileError) console.error('Profile upsert error:', profileError)

    sendWelcomeEmail(email, name).catch(console.error)
  }

  const needsConfirmation = !data.session

  return NextResponse.json({
    user: data.user,
    session: data.session,
    needsConfirmation,
  }, { status: 201 })
}
