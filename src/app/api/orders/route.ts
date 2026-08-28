import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendOrderConfirmation } from '@/lib/email'
import { sendWhatsAppOrderNotification } from '@/lib/whatsapp'
import { decrementStock } from '@/lib/inventory'

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

  const { items, promoCode, shippingAddress, paymentMethod } = await request.json()

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'No items provided' }, { status: 400 })
  }

  if (!shippingAddress || !paymentMethod) {
    return NextResponse.json({ error: 'Shipping address and payment method are required' }, { status: 400 })
  }

  const productIds = items.map((item: any) => item.productId)
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, price')
    .in('id', productIds)

  if (productsError) {
    return NextResponse.json({ error: 'Failed to validate products' }, { status: 500 })
  }

  const productMap = new Map(products?.map((p: any) => [p.id, p.price]) || [])

  let serverTotal = 0
  const orderItems = items.map((item: any) => {
    const serverPrice = productMap.get(item.productId)
    if (serverPrice === undefined) {
      throw new Error(`Product ${item.productId} not found`)
    }
    const quantity = Math.max(1, Math.min(99, parseInt(item.quantity) || 1))
    serverTotal += serverPrice * quantity
    return {
      product_id: item.productId,
      quantity,
      size: item.size || null,
      color: item.color || null,
      price: serverPrice,
    }
  })

  let discount = 0
  if (promoCode) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('discount_value, discount_type, min_cart')
      .eq('code', promoCode.toUpperCase())
      .eq('is_active', true)
      .single()

    if (coupon && serverTotal >= (coupon.min_cart || 0)) {
      discount = coupon.discount_type === 'percentage'
        ? (serverTotal * coupon.discount_value) / 100
        : coupon.discount_value
    }
  }

  const finalTotal = Math.max(0, serverTotal - discount)

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total: finalTotal,
      discount,
      promo_code: promoCode || null,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      status: 'pending',
      payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
    })
    .select()
    .single()

  if (orderError) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  const itemsWithOrderId = orderItems.map((item: any) => ({
    ...item,
    order_id: order.id,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(itemsWithOrderId)

  if (itemsError) {
    console.error('Order items insert error:', itemsError)
    await supabase.from('orders').delete().eq('id', order.id)
    return NextResponse.json({ error: 'Failed to create order items', details: itemsError.message }, { status: 500 })
  }

  const { data: profile } = await supabase.from('profiles').select('name, email').eq('id', user.id).single()

  if (profile?.email) {
    const productIds = items.map((item: any) => item.productId)
    const { data: productDetails } = await supabase.from('products').select('id, title').in('id', productIds)
    const titleMap = new Map(productDetails?.map((p: any) => [p.id, p.title]) || [])

    sendOrderConfirmation({
      orderId: order.id,
      customerName: profile.name || 'Customer',
      customerEmail: profile.email,
      items: items.map((item: any) => ({
        title: titleMap.get(item.productId) || 'Product',
        quantity: item.quantity,
        price: productMap.get(item.productId) || 0,
        size: item.size,
        color: item.color,
      })),
      total: finalTotal,
      shippingAddress: shippingAddress,
      }).catch(console.error)
  }

  for (const item of orderItems) {
    decrementStock(item.product_id, item.quantity).catch(console.error)
  }

  if (shippingAddress.phone) {
    const productIds = items.map((item: any) => item.productId)
    const { data: whatsappProducts } = await supabase.from('products').select('id, title').in('id', productIds)
    const whatsappTitleMap = new Map(whatsappProducts?.map((p: any) => [p.id, p.title]) || [])

    sendWhatsAppOrderNotification({
      id: order.id,
      total: finalTotal,
      items: items.map((item: any) => ({
        title: whatsappTitleMap.get(item.productId) || 'Product',
        quantity: item.quantity,
        size: item.size,
      })),
      customerName: profile?.name || 'Customer',
      customerPhone: shippingAddress.phone,
    }).catch(console.error)
  }

  return NextResponse.json({ order }, { status: 201 })
}
