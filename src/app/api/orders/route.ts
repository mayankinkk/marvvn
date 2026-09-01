import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderConfirmation } from '@/lib/email'
import { sendWhatsAppOrderNotification, sendWhatsAppCustomerOrderConfirmation } from '@/lib/whatsapp'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ orders: [] })
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(id, title, images, handle))')
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

  const { items, promoCode, shippingAddress, paymentMethod, orderNotes, giftMessage } = await request.json()

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'No items provided' }, { status: 400 })
  }

  if (!shippingAddress || !paymentMethod) {
    return NextResponse.json({ error: 'Shipping address and payment method are required' }, { status: 400 })
  }

  const productIds = items.map((item: any) => item.productId)
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, price, stock')
    .in('id', productIds)

  if (productsError) {
    return NextResponse.json({ error: 'Failed to validate products' }, { status: 500 })
  }

  const productMap = new Map(products?.map((p: any) => [p.id, p]) || [])

  // Check stock availability for all items
  for (const item of items) {
    const product = productMap.get(item.productId)
    if (!product) {
      return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 })
    }
    const quantity = Math.max(1, Math.min(99, parseInt(item.quantity) || 1))
    if (product.stock !== undefined && product.stock < quantity) {
      return NextResponse.json({
        error: `Insufficient stock for "${product.title || 'product'}". Only ${product.stock} available.`,
      }, { status: 400 })
    }
  }

  let serverTotal = 0
  const orderItems = items.map((item: any) => {
    const product = productMap.get(item.productId)
    const serverPrice = product!.price
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
      .select('discount_value, discount_type, min_cart, max_uses, used_count, expires_at')
      .eq('code', promoCode.toUpperCase())
      .eq('is_active', true)
      .single()

    if (coupon) {
      // Check expiry
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 })
      }
      // Check max uses
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 })
      }
      // Check minimum cart value
      if (serverTotal >= (coupon.min_cart || 0)) {
        discount = coupon.discount_type === 'percentage'
          ? (serverTotal * coupon.discount_value) / 100
          : coupon.discount_value
      }
    }
  }

  const finalTotal = Math.max(0, serverTotal - discount)

  const orderData: any = {
    total: finalTotal,
    discount,
    promo_code: promoCode || null,
    shipping_address: { ...shippingAddress, email: shippingAddress.email || user?.email },
    payment_method: paymentMethod,
    status: 'pending',
    payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
    order_notes: orderNotes || null,
    gift_message: giftMessage || null,
  }

  if (user) {
    orderData.user_id = user.id
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderData)
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

  // Send confirmation email
  const customerEmail = shippingAddress.email || user?.email || ''
  
  let customerName = shippingAddress.firstName || 'Customer'
  if (user && !shippingAddress.firstName) {
    const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).single()
    if (profile?.name) customerName = profile.name
  }

  if (customerEmail) {
    const { data: productDetails } = await supabase.from('products').select('id, title').in('id', productIds)
    const titleMap = new Map(productDetails?.map((p: any) => [p.id, p.title]) || [])

    sendOrderConfirmation({
      orderId: order.id,
      customerName,
      customerEmail,
      items: items.map((item: any) => ({
        title: titleMap.get(item.productId) || 'Product',
        quantity: item.quantity,
        price: productMap.get(item.productId)?.price || 0,
        size: item.size,
        color: item.color,
      })),
      total: finalTotal,
      shippingAddress: shippingAddress,
    }).catch(console.error)
  }

  // Atomic stock decrement using admin client to bypass RLS
  const admin = createAdminClient()
  for (const item of orderItems) {
    const { error: stockError } = await admin
      .rpc('decrement_stock', { p_product_id: item.product_id, p_quantity: item.quantity })
      .single()

    // Fallback to manual decrement if RPC doesn't exist
    if (stockError) {
      const { data: product } = await admin
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single()

      if (product && (product.stock || 0) >= item.quantity) {
        await admin
          .from('products')
          .update({ stock: (product.stock || 0) - item.quantity })
          .eq('id', item.product_id)
          .lte('stock', product.stock!)
      }
    }
  }

  // Increment coupon usage
  if (promoCode && discount > 0) {
    const { data: coupon } = await admin
      .from('coupons')
      .select('used_count')
      .eq('code', promoCode.toUpperCase())
      .single()

    if (coupon) {
      await admin
        .from('coupons')
        .update({ used_count: (coupon.used_count || 0) + 1 })
        .eq('code', promoCode.toUpperCase())
    }
  }

  if (shippingAddress.phone) {
    const { data: whatsappProducts } = await supabase.from('products').select('id, title').in('id', productIds)
    const whatsappTitleMap = new Map(whatsappProducts?.map((p: any) => [p.id, p.title]) || [])

    const whatsappItems = items.map((item: any) => ({
      title: whatsappTitleMap.get(item.productId) || 'Product',
      quantity: item.quantity,
      size: item.size,
    }))

    // Notify admin
    sendWhatsAppOrderNotification({
      id: order.id,
      total: finalTotal,
      items: whatsappItems,
      customerName,
      customerPhone: shippingAddress.phone,
    }).catch(console.error)

    // Send customer confirmation
    sendWhatsAppCustomerOrderConfirmation({
      id: order.id,
      total: finalTotal,
      items: whatsappItems,
      customerName,
      customerPhone: shippingAddress.phone,
      shippingAddress: shippingAddress,
    }).catch(console.error)
  }

  return NextResponse.json({ order, guestCheckout: !user }, { status: 201 })
}
