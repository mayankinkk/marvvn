import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderConfirmation } from '@/lib/email'
import { sendWhatsAppOrderNotification, sendWhatsAppCustomerOrderConfirmation } from '@/lib/whatsapp'
import { scheduleReviewRequest } from '@/lib/scheduled-emails'

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
    .select('id, title, price')
    .in('id', productIds)

  if (productsError) {
    return NextResponse.json({ error: 'Failed to validate products' }, { status: 500 })
  }

  const productMap = new Map(products?.map((p: any) => [p.id, p]) || [])

  // Fetch variants for all products
  let variantMap = new Map<string, number>()
  const { data: allVariants, error: variantError } = await supabase
    .from('product_variants')
    .select('product_id, size, color, stock')
    .in('product_id', productIds)

  // Only use variant data if the table exists (no error)
  if (!variantError && allVariants) {
    for (const v of allVariants) {
      variantMap.set(`${v.product_id}|${v.size}|${v.color}`, v.stock)
    }
  }

  // Check stock availability for all items
  for (const item of items) {
    const product = productMap.get(item.productId)
    if (!product) {
      return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 })
    }
    const quantity = Math.max(1, Math.min(99, parseInt(item.quantity) || 1))
    const size = item.size || ''
    const color = item.color || ''
    const variantKey = `${item.productId}|${size}|${color}`
    const variantStock = variantMap.get(variantKey)

    // Variant stock check (when product_variants table exists)
    if (variantMap.size > 0 || !variantError) {
      if (variantStock !== undefined && variantStock < quantity) {
        return NextResponse.json({
          error: `Insufficient stock for "${product.title || 'product'}" (${size}/${color}). Only ${variantStock} available.`,
        }, { status: 400 })
      }
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

  // Use admin client for insert to bypass RLS (guest orders have no user_id)
  const admin = createAdminClient()
  const { data: order, error: orderError } = await admin
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

  const { error: itemsError } = await admin.from('order_items').insert(itemsWithOrderId)

  if (itemsError) {
    console.error('Order items insert error:', itemsError)
    await admin.from('orders').delete().eq('id', order.id)
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
  // Only if product_variants table exists (variantError is null)
  if (!variantError) {
    for (const item of orderItems) {
      const size = item.size || ''
      const color = item.color || ''
      const variantKey = `${item.product_id}|${size}|${color}`
      const hasVariant = variantMap.has(variantKey)

      if (hasVariant) {
        // Decrement variant stock
        const { error: rpcError } = await admin
          .rpc('decrement_variant_stock', {
            p_product_id: item.product_id,
            p_size: size,
            p_color: color,
            p_quantity: item.quantity,
          })
          .single()

        if (rpcError) {
          // Fallback: manual variant stock decrement
          const { data: variant } = await admin
            .from('product_variants')
            .select('stock')
            .eq('product_id', item.product_id)
            .eq('size', size)
            .eq('color', color)
            .single()

          if (variant && variant.stock >= item.quantity) {
            await admin
              .from('product_variants')
              .update({ stock: variant.stock - item.quantity })
              .eq('product_id', item.product_id)
              .eq('size', size)
              .eq('color', color)
          }
        }
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

  // Schedule review request email (7 days from now)
  if (customerEmail) {
    const { data: reviewProducts } = await supabase
      .from('products')
      .select('id, title, handle')
      .in('id', productIds)

    const reviewProductMap = new Map(reviewProducts?.map((p: any) => [p.id, p]) || [])
    const reviewItems = items.map((item: any) => {
      const product = reviewProductMap.get(item.productId)
      return {
        title: product?.title || 'Product',
        handle: product?.handle || '',
      }
    }).filter(item => item.handle)

    scheduleReviewRequest(
      order.id,
      user?.id,
      customerEmail,
      customerName,
      reviewItems,
      7
    ).catch(console.error)
  }

  return NextResponse.json({ order, guestCheckout: !user }, { status: 201 })
}
