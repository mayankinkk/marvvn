import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { handle: string } }
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('handle', params.handle)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const product = {
    id: data.id,
    handle: data.handle,
    title: data.title,
    description: data.description,
    price: data.price,
    compareAtPrice: data.compare_at_price,
    images: data.images,
    category: data.category,
    collection: data.collection,
    tags: data.tags,
    sizes: data.sizes,
    colors: data.colors,
    isNew: data.is_new,
    isBestseller: data.is_bestseller,
    badge: data.badge,
  }

  return NextResponse.json({ product })
}
