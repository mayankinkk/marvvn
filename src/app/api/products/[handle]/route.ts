import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

  // Fetch variants using admin client to bypass RLS
  const admin = createAdminClient()
  const { data: variants } = await admin
    .from('product_variants')
    .select('id, size, color, stock, sku')
    .eq('product_id', data.id)
    .order('size')

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
    stock: data.stock,
    low_stock_threshold: data.low_stock_threshold,
    flash_sale: data.flash_sale,
    flash_sale_price: data.flash_sale_price,
    flash_sale_ends_at: data.flash_sale_ends_at,
    fabric_composition: data.fabric_composition,
    gsm: data.gsm,
    waist: data.waist,
    length: data.length,
    model_info: data.model_info,
    what_you_get: data.what_you_get,
    size_fit_text: data.size_fit_text,
    variants: variants || [],
  }

  return NextResponse.json({ product })
}
