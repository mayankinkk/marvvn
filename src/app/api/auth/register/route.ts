import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const { name, email, password } = await request.json()

  const supabase = createClient()
  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await admin.from('profiles').upsert({ id: data.user.id, name, email })

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError) {
    return NextResponse.json({ user: data.user }, { status: 201 })
  }

  return NextResponse.json({ user: data.user }, { status: 201 })
}
