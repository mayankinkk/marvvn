import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function isAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin || false
}

export async function GET() {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, email, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })

  const userIds = (profiles || []).map((p: any) => p.id)
  const { data: orders } = await supabase
    .from('orders')
    .select('user_id, total, status')
    .in('user_id', userIds.length > 0 ? userIds : ['none'])

  const customers = (profiles || []).map((profile: any) => {
    const userOrders = (orders || []).filter((o: any) => o.user_id === profile.id)
    return {
      ...profile,
      totalOrders: userOrders.length,
      totalSpent: userOrders.reduce((sum: number, o: any) => sum + (o.status !== 'cancelled' ? Number(o.total) : 0), 0),
    }
  })

  return NextResponse.json({ customers })
}
