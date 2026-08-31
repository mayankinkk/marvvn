import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withErrorHandling, validateAuth, ApiError } from '@/lib/api-handler'

export async function GET() {
  return withErrorHandling(async () => {
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
      throw new ApiError(500, 'Failed to fetch cart')
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
  })
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    validateAuth(user)

    const { productId, quantity, size, color } = await request.json()

    if (!productId || typeof productId !== 'string') {
      throw new ApiError(400, 'Valid productId is required')
    }

    const validQuantity = Math.max(1, Math.min(99, parseInt(quantity) || 1))

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      throw new ApiError(404, 'Product not found')
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
      throw new ApiError(500, 'Failed to add to cart')
    }

    return NextResponse.json({ item: data }, { status: 201 })
  })
}

export async function DELETE(request: Request) {
  return withErrorHandling(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    validateAuth(user)

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
        throw new ApiError(500, 'Failed to clear cart')
      }
      return NextResponse.json({ success: true })
    }

    if (!productId) {
      throw new ApiError(400, 'productId is required')
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .eq('size', size || '')
      .eq('color', color || '')

    if (error) {
      throw new ApiError(500, 'Failed to remove from cart')
    }

    return NextResponse.json({ success: true })
  })
}
