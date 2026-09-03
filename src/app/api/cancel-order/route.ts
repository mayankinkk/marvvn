import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { orderId, email } = body

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Prefer user_id ownership check (RLS-proof); fallback to email lookup for legacy/guest orders
  let order: any = null
  let fetchError: any = null
  {
    const res = await admin.from('orders').select('*').eq('id', orderId).eq('user_id', user.id).single()
    order = res.data
    fetchError = res.error
  }
  if ((fetchError || !order) && email) {
    const res = await admin.from('orders').select('*').eq('id', orderId).eq('shipping_address->>email', email).single()
    if (!res.error && res.data) {
      order = res.data
      fetchError = null
    }
  }
  // Final fallback: try by id alone and verify ownership via email match
  if (fetchError || !order) {
    const res = await admin.from('orders').select('*').eq('id', orderId).single()
    if (!res.error && res.data && (res.data.user_id === user.id || res.data.shipping_address?.email === user.email || res.data.shipping_address?.email === email)) {
      order = res.data
      fetchError = null
    }
  }

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (order.status === 'cancelled') {
    return NextResponse.json({ error: 'Order is already cancelled' }, { status: 400 })
  }

  if (order.status === 'shipped' || order.status === 'out_for_delivery' || order.status === 'delivered') {
    return NextResponse.json({ error: 'Order has already been shipped/delivered and cannot be cancelled' }, { status: 400 })
  }

  // Build update payload — handle missing status_history column gracefully
  const updatePayload: any = { status: 'cancelled', updated_at: new Date().toISOString() }
  try {
    const { data: cur, error: histErr } = await admin.from('orders').select('status_history').eq('id', orderId).single()
    if (!histErr && cur) {
      const history = Array.isArray((cur as any).status_history) ? (cur as any).status_history : []
      history.push({ status: 'cancelled', timestamp: new Date().toISOString() })
      updatePayload.status_history = history
    }
  } catch {}

  const { error: updateError } = await admin
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId)

  if (updateError) {
    // If status_history column missing, retry without it
    if (updateError.message?.includes('status_history')) {
      const { error: retryErr } = await admin.from('orders').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', orderId)
      if (retryErr) {
        return NextResponse.json({ error: 'Failed to cancel order: ' + retryErr.message }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: 'Failed to cancel order: ' + updateError.message }, { status: 500 })
    }
  }

  // Restore stock (via admin, bypasses RLS)
  const { data: items } = await admin
    .from('order_items')
    .select('product_id, quantity, size, color')
    .eq('order_id', orderId)

  if (items) {
    for (const item of items) {
      const size = item.size || ''
      const color = item.color || ''

      // Check if this product has variants
      const { data: variant } = await admin
        .from('product_variants')
        .select('id')
        .eq('product_id', item.product_id)
        .eq('size', size)
        .eq('color', color)
        .single()

      if (variant) {
        // Restore variant stock
        try {
          await admin.rpc('increment_variant_stock', {
            p_product_id: item.product_id,
            p_size: size,
            p_color: color,
            p_quantity: item.quantity,
          })
        } catch {
          const { data: v } = await admin
            .from('product_variants')
            .select('stock')
            .eq('product_id', item.product_id)
            .eq('size', size)
            .eq('color', color)
            .single()
          if (v) {
            await admin.from('product_variants')
              .update({ stock: v.stock + item.quantity })
              .eq('product_id', item.product_id)
              .eq('size', size)
              .eq('color', color)
          }
        }
      } else {
        // Fall back to product-level stock
        try {
          await admin.rpc('increment_stock', {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          })
        } catch {
          const { data: prod } = await admin
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single()
          if (prod) {
            await admin.from('products')
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
