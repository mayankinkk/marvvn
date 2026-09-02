import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, total, status, payment_status, created_at, tracking_number, payment_method, order_items(id, quantity, size, color, price, product_id, products(title, images, handle))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const totalOrders = orders?.length || 0
  const totalSpent = orders?.reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0
  const pendingOrders = orders?.filter((o: any) => o.status === 'pending' || o.status === 'processing' || o.status === 'shipped').length || 0

  return NextResponse.json({ totalOrders, totalSpent, pendingOrders, recentOrders: orders?.slice(0, 5) || [] }, {
    headers: { 'Cache-Control': 'no-store, must-revalidate' },
  })
}
