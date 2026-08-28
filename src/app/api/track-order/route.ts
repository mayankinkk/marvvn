import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')
  const email = searchParams.get('email')

  if (!orderId || !email) {
    return NextResponse.json({ error: 'Order ID and email are required' }, { status: 400 })
  }

  const supabase = createClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      total,
      created_at,
      shipping_address,
      order_items (
        id,
        quantity,
        size,
        products ( title, handle, image_url )
      )
    `)
    .eq('id', orderId)
    .eq('shipping_address->>email', email)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found. Please check your order ID and email.' }, { status: 404 })
  }

  return NextResponse.json({ order })
}
