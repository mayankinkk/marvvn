import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

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

  return NextResponse.json({ products })
}
