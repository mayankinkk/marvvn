import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = createClient()

  const { searchParams } = new URL(request.url)
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '100')))
  const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))

  const { data, error, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const products = data.map((p) => ({
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description,
    price: p.price,
    compareAtPrice: p.compare_at_price,
    images: p.images,
    category: p.category,
    collection: p.collection,
    tags: p.tags,
    sizes: p.sizes,
    colors: p.colors,
    isNew: p.is_new,
    isBestseller: p.is_bestseller,
    badge: p.badge,
  }))

  return NextResponse.json({ products, total: count }, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  })
}
