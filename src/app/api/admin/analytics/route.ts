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

  const [ordersRes, productsRes, usersRes, itemsRes] = await Promise.all([
    supabase.from('orders').select('id, status, total, created_at, payment_method, shipping_address, promo_code, discount'),
    supabase.from('products').select('id, title, price, stock, category, images'),
    supabase.from('profiles').select('id, created_at'),
    supabase.from('order_items').select('id, order_id, product_id, quantity, price, size, color'),
  ])

  const orders = ordersRes.data || []
  const products = productsRes.data || []
  const users = usersRes.data || []
  const items = itemsRes.data || []

  // Revenue (exclude cancelled)
  const activeOrders = orders.filter(o => o.status !== 'cancelled')
  const totalRevenue = activeOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0)
  const totalOrders = activeOrders.length
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Revenue by day (last 30 days)
  const dailyRevenue: { date: string; revenue: number; orders: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayOrders = activeOrders.filter(o => o.created_at?.startsWith(dateStr))
    dailyRevenue.push({
      date: dateStr,
      revenue: dayOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0),
      orders: dayOrders.length,
    })
  }

  // Revenue by category
  const productMap = new Map(products.map(p => [p.id, p]))
  const categoryRevenue: Record<string, number> = {}
  items.forEach(item => {
    const product = productMap.get(item.product_id)
    if (product) {
      const cat = product.category || 'other'
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (parseFloat(item.price) || 0) * item.quantity
    }
  })

  // Top products by revenue
  const productRevenue: Record<string, { title: string; revenue: number; quantity: number; image: string }> = {}
  items.forEach(item => {
    const product = productMap.get(item.product_id)
    if (product) {
      if (!productRevenue[item.product_id]) {
        productRevenue[item.product_id] = {
          title: product.title,
          revenue: 0,
          quantity: 0,
          image: product.images?.[0] || '',
        }
      }
      productRevenue[item.product_id].revenue += (parseFloat(item.price) || 0) * item.quantity
      productRevenue[item.product_id].quantity += item.quantity
    }
  })
  const topProducts = Object.entries(productRevenue)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 10)
    .map(([id, data]) => ({ id, ...data }))

  // Top sizes
  const sizeCount: Record<string, number> = {}
  items.forEach(item => {
    if (item.size) {
      sizeCount[item.size] = (sizeCount[item.size] || 0) + item.quantity
    }
  })
  const topSizes = Object.entries(sizeCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([size, count]) => ({ size, count }))

  // Top colors
  const colorCount: Record<string, number> = {}
  items.forEach(item => {
    if (item.color) {
      colorCount[item.color] = (colorCount[item.color] || 0) + item.quantity
    }
  })
  const topColors = Object.entries(colorCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([color, count]) => ({ color, count }))

  // Payment method breakdown
  const paymentMethods: Record<string, { count: number; revenue: number }> = {}
  activeOrders.forEach(o => {
    const method = o.payment_method || 'unknown'
    if (!paymentMethods[method]) paymentMethods[method] = { count: 0, revenue: 0 }
    paymentMethods[method].count++
    paymentMethods[method].revenue += parseFloat(o.total) || 0
  })

  // Promo code usage
  const promoUsage: Record<string, { count: number; totalDiscount: number }> = {}
  activeOrders.forEach(o => {
    if (o.promo_code) {
      if (!promoUsage[o.promo_code]) promoUsage[o.promo_code] = { count: 0, totalDiscount: 0 }
      promoUsage[o.promo_code].count++
      promoUsage[o.promo_code].totalDiscount += parseFloat(o.discount) || 0
    }
  })

  // Conversion rate (orders / visitors — approximate using users as proxy)
  const totalUsers = users.length
  const conversionRate = totalUsers > 0 ? ((totalOrders / totalUsers) * 100) : 0

  // Low stock products
  const lowStockProducts = products
    .filter(p => p.stock !== undefined && p.stock <= 5)
    .map(p => ({ id: p.id, title: p.title, stock: p.stock }))

  return NextResponse.json({
    totalRevenue,
    totalOrders,
    cancelledOrders,
    avgOrderValue,
    totalProducts: products.length,
    totalUsers,
    conversionRate,
    dailyRevenue,
    categoryRevenue,
    topProducts,
    topSizes,
    topColors,
    paymentMethods,
    promoUsage,
    lowStockProducts,
  })
}
