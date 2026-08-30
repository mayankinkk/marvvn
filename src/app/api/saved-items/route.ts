import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET — list saved items for current user
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ items: [] })

  const { data } = await supabase
    .from('saved_items')
    .select('*, products(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const items = (data || []).map((item: any) => ({
    id: item.id,
    productId: item.product_id,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    product: item.products ? {
      id: item.products.id,
      handle: item.products.handle,
      title: item.products.title,
      price: item.products.price,
      compare_at_price: item.products.compare_at_price,
      images: item.products.images,
      category: item.products.category,
      sizes: item.products.sizes,
      colors: item.products.colors,
      stock: item.products.stock,
    } : null,
  })).filter((item: any) => item.product)

  return NextResponse.json({ items })
}

// POST — save an item for later
export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId, size, color, quantity } = await request.json()
  if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })

  const admin = createAdminClient()

  const { error } = await admin
    .from('saved_items')
    .upsert({
      user_id: user.id,
      product_id: productId,
      size: size || null,
      color: color || null,
      quantity: quantity || 1,
    }, { onConflict: 'user_id,product_id,size,color' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true }, { status: 201 })
}

// DELETE — remove a saved item (or remove from cart)
export async function DELETE(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { productId, size, color, clearAll } = body || {}

  const admin = createAdminClient()

  if (clearAll) {
    await admin.from('saved_items').delete().eq('user_id', user.id)
    return NextResponse.json({ success: true })
  }

  if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })

  const { error } = await admin
    .from('saved_items')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .eq('size', size || '')
    .eq('color', color || '')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
