import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, phone, currentPassword, newPassword } = body

  if (name || phone) {
    const updates: any = {}
    if (name) updates.full_name = name
    if (phone) updates.phone = phone

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      ...updates,
    }, { onConflict: 'id' })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  if (currentPassword && newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
