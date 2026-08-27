import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ items: [] })
  }

  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*, products(*)')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const items = data.map((item: any) => ({
    id: item.products.id,
    handle: item.products.handle,
    title: item.products.title,
    description: item.products.description,
    price: item.products.price,
    compareAtPrice: item.products.compare_at_price,
    images: item.products.images,
    category: item.products.category,
    collection: item.products.collection,
    tags: item.products.tags,
    sizes: item.products.sizes,
    colors: item.products.colors,
    isNew: item.products.is_new,
    isBestseller: item.products.is_bestseller,
    badge: item.products.badge,
  }))

  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { productId } = await request.json()

  const { error } = await supabase
    .from('wishlist_items')
    .upsert({ user_id: user.id, product_id: productId }, { onConflict: 'user_id,product_id' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}

export async function DELETE(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { productId } = await request.json()

  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
