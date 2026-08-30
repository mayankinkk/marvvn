import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ items: [] })
  }

  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(*)')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const items = data.map((item: any) => ({
    id: item.id,
    productId: item.product_id,
    quantity: item.quantity,
    size: item.size,
    color: item.color,
    product: {
      id: item.products.id,
      handle: item.products.handle,
      title: item.products.title,
      price: item.products.price,
      compareAtPrice: item.products.compare_at_price,
      images: item.products.images,
      category: item.products.category,
      sizes: item.products.sizes,
      colors: item.products.colors,
    },
  }))

  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { productId, quantity, size, color } = await request.json()

  if (!productId || typeof productId !== 'string') {
    return NextResponse.json({ error: 'Valid productId is required' }, { status: 400 })
  }

  const validQuantity = Math.max(1, Math.min(99, parseInt(quantity) || 1))

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('cart_items')
    .upsert(
      { user_id: user.id, product_id: productId, quantity: validQuantity, size: size || null, color: color || null },
      { onConflict: 'user_id,product_id,size,color' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ item: data }, { status: 201 })
}

export async function DELETE(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const { productId, size, color, clearAll } = body || {}

  if (clearAll) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .eq('size', size || '')
    .eq('color', color || '')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
