import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = createClient()

  const { products } = await import('@/lib/data')

  const seedData = products.map((p) => ({
    handle: p.handle,
    title: p.title,
    description: p.description,
    price: p.price,
    compare_at_price: p.compareAtPrice || null,
    images: p.images,
    category: p.category,
    collection: p.collection,
    tags: p.tags,
    sizes: p.sizes,
    colors: p.colors,
    is_new: p.isNew || false,
    is_bestseller: p.isBestseller || false,
    badge: p.badge || null,
  }))

  const { data, error } = await supabase
    .from('products')
    .upsert(seedData, { onConflict: 'handle' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, count: seedData.length })
}
