import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

  // Compute stock from product_variants
  const productIds = (data || []).map(p => p.id)
  let variantMap = new Map<string, number>()
  let availableSizesMap = new Map<string, { size: string; stock: number }[]>()

  try {
    const admin = createAdminClient()
    const { data: variants } = await admin
      .from('product_variants')
      .select('product_id, size, stock')
      .in('product_id', productIds)

    for (const v of variants || []) {
      const current = variantMap.get(v.product_id) || 0
      variantMap.set(v.product_id, current + (v.stock || 0))

      if (v.stock > 0 && v.size) {
        const list = availableSizesMap.get(v.product_id) || []
        const existing = list.find(item => item.size === v.size)
        if (existing) {
          existing.stock += v.stock
        } else {
          list.push({ size: v.size, stock: v.stock })
        }
        availableSizesMap.set(v.product_id, list)
      }
    }
  } catch {
    // product_variants table may not exist yet
  }

  const products = data.map((p) => {
    const hasVariants = variantMap.has(p.id)
    const stock = hasVariants ? variantMap.get(p.id) : (p.stock || 0)

    let availableSizes: { size: string; stock: number }[] = []
    if (availableSizesMap.has(p.id)) {
      availableSizes = availableSizesMap.get(p.id) || []
    } else if (!hasVariants && stock > 0 && Array.isArray(p.sizes)) {
      availableSizes = p.sizes.map((s: string) => ({ size: s, stock }))
    }

    return {
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
      stock,
      availableSizes,
    }
  })

  return NextResponse.json({ products, total: count }, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  })
}
