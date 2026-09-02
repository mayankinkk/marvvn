import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const body = await request.json()
  const { orderId, email } = body

  if (!orderId || !email) {
    return NextResponse.json({ error: 'Order ID and email are required' }, { status: 400 })
  }

  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('shipping_address->>email', email)
    .single()

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (order.status === 'cancelled') {
    return NextResponse.json({ error: 'Order is already cancelled' }, { status: 400 })
  }

  if (order.status === 'shipped' || order.status === 'out_for_delivery' || order.status === 'delivered') {
    return NextResponse.json({ error: 'Order has already been shipped/delivered and cannot be cancelled' }, { status: 400 })
  }

  const orderTime = new Date(order.created_at).getTime()
  const now = Date.now()
  const oneHour = 60 * 60 * 1000

  if (now - orderTime > oneHour) {
    return NextResponse.json({ error: 'Cancellation window has expired (1 hour limit)' }, { status: 400 })
  }

  const statusHistory = Array.isArray(order.status_history) ? order.status_history : []
  statusHistory.push({ status: 'cancelled', timestamp: new Date().toISOString() })

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      status_history: statusHistory,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 })
  }

  // Restore stock
  const { data: items } = await supabase
    .from('order_items')
    .select('product_id, quantity, size, color')
    .eq('order_id', orderId)

  if (items) {
    for (const item of items) {
      const size = item.size || ''
      const color = item.color || ''

      // Check if this product has variants
      const { data: variant } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', item.product_id)
        .eq('size', size)
        .eq('color', color)
        .single()

      if (variant) {
        // Restore variant stock
        try {
          await supabase.rpc('increment_variant_stock', {
            p_product_id: item.product_id,
            p_size: size,
            p_color: color,
            p_quantity: item.quantity,
          })
        } catch {
          const { data: v } = await supabase
            .from('product_variants')
            .select('stock')
            .eq('product_id', item.product_id)
            .eq('size', size)
            .eq('color', color)
            .single()
          if (v) {
            await supabase.from('product_variants')
              .update({ stock: v.stock + item.quantity })
              .eq('product_id', item.product_id)
              .eq('size', size)
              .eq('color', color)
          }
        }
      } else {
        // Fall back to product-level stock
        try {
          await supabase.rpc('increment_stock', {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          })
        } catch {
          const { data: prod } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single()
          if (prod) {
            await supabase.from('products')
              .update({ stock: (prod.stock || 0) + item.quantity })
              .eq('id', item.product_id)
          }
        }
      }
    }
  }

  // Send cancellation notification
  const phone = (order.shipping_address as any)?.phone
  if (phone) {
    const { sendWhatsAppOrderStatusUpdate } = await import('@/lib/whatsapp')
    sendWhatsAppOrderStatusUpdate(phone, orderId, 'cancelled').catch(console.error)
  }

  return NextResponse.json({ success: true, message: 'Order cancelled successfully' })
}
