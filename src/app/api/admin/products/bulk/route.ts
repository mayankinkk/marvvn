import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function isAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin || false
}

export async function PUT(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { ids, action, value } = body

  if (!ids?.length || !action) {
    return NextResponse.json({ error: 'ids and action are required' }, { status: 400 })
  }

  const updates: Record<string, any> = {}

  switch (action) {
    case 'price':
      if (typeof value !== 'number' || value < 0) {
        return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
      }
      updates.price = value
      break
    case 'compare_at_price':
      updates.compare_at_price = value || null
      break
    case 'badge':
      updates.badge = value || null
      break
    case 'is_new':
      updates.is_new = value
      break
    case 'is_bestseller':
      updates.is_bestseller = value
      break
    case 'category':
      updates.category = value || ''
      break
    case 'delete':
      const { error: delError } = await supabase.from('products').delete().in('id', ids)
      if (delError) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
      return NextResponse.json({ success: true, deleted: ids.length })
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const { error } = await supabase.from('products').update(updates).in('id', ids)
  if (error) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })

  return NextResponse.json({ success: true, updated: ids.length })
}
