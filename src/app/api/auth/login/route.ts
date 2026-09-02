import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = createClient()
  const { email, password } = await request.json()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  // Ensure profile exists (use admin client to bypass RLS)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .single()

  if (!profile) {
    const admin = createAdminClient()
    await admin.from('profiles').upsert({
      id: data.user.id,
      name: data.user.user_metadata?.name || '',
      email: data.user.email,
    }, { onConflict: 'id' })
  }

  return NextResponse.json({
    user: data.user,
    session: data.session,
  })
}
