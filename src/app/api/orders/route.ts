import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ orders: [] })
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ orders })
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { items, total, discount, promoCode, shippingAddress, paymentMethod } = await request.json()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total,
      discount: discount || 0,
      promo_code: promoCode || null,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      status: 'pending',
      payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
    })
    .select()
    .single()

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 })
  }

  const orderItems = items.map((item: any) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    size: item.size,
    color: item.color,
    price: item.price,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  return NextResponse.json({ order }, { status: 201 })
}
