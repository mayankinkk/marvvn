import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [products, orders, users, recentOrders] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id, total, status', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(10),
  ])

  const totalRevenue = orders.data?.reduce((sum: number, o: any) => sum + (o.status !== 'cancelled' ? Number(o.total) : 0), 0) || 0
  const pendingOrders = orders.data?.filter((o: any) => o.status === 'pending').length || 0
  const totalProducts = products.count || 0
  const totalOrders = orders.count || 0
  const totalUsers = users.count || 0

  return NextResponse.json({
    totalRevenue,
    pendingOrders,
    totalProducts,
    totalOrders,
    totalUsers,
    recentOrders: recentOrders.data || [],
  })
}
