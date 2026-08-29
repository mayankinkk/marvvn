import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function isAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin || false
}

export async function GET() {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })

  return NextResponse.json({ messages: data || [] })
}

export async function PUT(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin
    .from('contact_messages')
    .update({ is_read: true })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin
    .from('contact_messages')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })

  return NextResponse.json({ success: true })
}
