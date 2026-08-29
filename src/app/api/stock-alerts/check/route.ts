import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendBackInStockAlert } from '@/lib/email'

export async function POST(request: Request) {
  const { productId } = await request.json()

  if (!productId) {
    return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Check if product is back in stock
  const { data: product } = await admin
    .from('products')
    .select('id, title, stock, handle')
    .eq('id', productId)
    .single()

  if (!product || (product.stock || 0) <= 0) {
    return NextResponse.json({ success: false })
  }

  // Get all users who signed up for alerts
  const { data: alerts } = await admin
    .from('stock_alerts')
    .select('id, user_id, email, notified')
    .eq('product_id', productId)
    .eq('notified', false)

  if (!alerts || alerts.length === 0) {
    return NextResponse.json({ success: true, notified: 0 })
  }

  let notifiedCount = 0

  for (const alert of alerts) {
    try {
      await sendBackInStockAlert(alert.email, product.title, product.handle)
      notifiedCount++
    } catch (e) {
      console.error('Back-in-stock email failed:', e)
    }
  }

  // Mark as notified
  await admin
    .from('stock_alerts')
    .update({ notified: true })
    .eq('product_id', productId)
    .eq('notified', false)

  return NextResponse.json({ success: true, notified: notifiedCount })
}
