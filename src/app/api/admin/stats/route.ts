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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()
  const [products, orders, users, recentOrders] = await Promise.all([
    admin.from('products').select('id', { count: 'exact', head: true }),
    admin.from('orders').select('id, total, status, payment_method, created_at, promo_code, discount, order_items(quantity, price)'),
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('orders').select('*, order_items(*, products(title, handle, images))').order('created_at', { ascending: false }).limit(5),
  ])

  const allOrders = orders.data || []
  const totalRevenue = allOrders.reduce((sum: number, o: any) => sum + (o.status !== 'cancelled' ? Number(o.total) : 0), 0)
  const pendingOrders = allOrders.filter((o: any) => o.status === 'pending').length
  const totalProducts = products.count || 0
  const totalOrders = allOrders.length
  const totalUsers = users.count || 0

  // Revenue last 7 days
  const now = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const dailyRevenue = last7Days.map((date) => {
    const dayOrders = allOrders.filter((o: any) => {
      const oDate = new Date(o.created_at).toISOString().split('T')[0]
      return oDate === date && o.status !== 'cancelled'
    })
    return {
      date,
      label: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: dayOrders.reduce((sum: number, o: any) => sum + Number(o.total), 0),
      orders: dayOrders.length,
    }
  })

  // Status breakdown
  const statusBreakdown = {
    pending: allOrders.filter((o: any) => o.status === 'pending').length,
    confirmed: allOrders.filter((o: any) => o.status === 'confirmed').length,
    shipped: allOrders.filter((o: any) => o.status === 'shipped').length,
    delivered: allOrders.filter((o: any) => o.status === 'delivered').length,
    cancelled: allOrders.filter((o: any) => o.status === 'cancelled').length,
  }

  // Top products by revenue
  const productRevenue: Record<string, { title: string, handle: string, quantity: number, revenue: number }> = {}
  allOrders.forEach((o: any) => {
    o.order_items?.forEach((item: any) => {
      if (item.products) {
        const key = item.products.handle
        if (!productRevenue[key]) {
          productRevenue[key] = { title: item.products.title, handle: item.products.handle, quantity: 0, revenue: 0 }
        }
        productRevenue[key].quantity += item.quantity
        productRevenue[key].revenue += item.price * item.quantity
      }
    })
  })
  const topProducts = Object.values(productRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

  // Promo code usage
  const promoUsage: Record<string, { count: number, totalDiscount: number }> = {}
  allOrders.forEach((o: any) => {
    if (o.promo_code) {
      if (!promoUsage[o.promo_code]) promoUsage[o.promo_code] = { count: 0, totalDiscount: 0 }
      promoUsage[o.promo_code].count++
      promoUsage[o.promo_code].totalDiscount += o.total * (o.discount / 100)
    }
  })

  // Payment method breakdown
  const paymentMethods = {
    cod: allOrders.filter((o: any) => o.payment_method === 'cod').length,
    upi: allOrders.filter((o: any) => o.payment_method === 'upi').length,
    card: allOrders.filter((o: any) => o.payment_method === 'card').length,
  }

  const avgOrderValue = totalOrders > 0 ? totalRevenue / allOrders.filter((o: any) => o.status !== 'cancelled').length : 0

  return NextResponse.json({
    totalRevenue,
    pendingOrders,
    totalProducts,
    totalOrders,
    totalUsers,
    recentOrders: recentOrders.data || [],
    dailyRevenue,
    statusBreakdown,
    topProducts,
    promoUsage: Object.entries(promoUsage).map(([code, data]) => ({ code, ...data })),
    paymentMethods,
    avgOrderValue: isNaN(avgOrderValue) ? 0 : avgOrderValue,
  })
}
