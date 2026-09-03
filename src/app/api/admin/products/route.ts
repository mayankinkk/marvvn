import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function isAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin || false
}

export async function GET() {
  const supabase = createClient()

  if (!(await isAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }

  // Fetch all variants to compute total stock and available sizes per product (use admin client to bypass RLS)
  const productIds = (data || []).map(p => p.id)
  let variantMap = new Map<string, number>()
  let availableSizesMap = new Map<string, { size: string; stock: number }[]>()
  let allVariantsMap = new Map<string, any[]>()

  try {
    const admin = createAdminClient()
    const { data: variants } = await admin
      .from('product_variants')
      .select('id, product_id, size, color, stock')
      .in('product_id', productIds)

    for (const v of variants || []) {
      const current = variantMap.get(v.product_id) || 0
      variantMap.set(v.product_id, current + (v.stock || 0))

      const varList = allVariantsMap.get(v.product_id) || []
      varList.push(v)
      allVariantsMap.set(v.product_id, varList)

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

  // Attach total stock, variants, and available sizes to each product
  const productsWithStock = (data || []).map(p => {
    const hasVariantEntries = variantMap.has(p.id)
    const stock = hasVariantEntries ? variantMap.get(p.id) : (p.stock || 0)

    let availableSizes: { size: string; stock: number }[] = []
    if (availableSizesMap.has(p.id)) {
      availableSizes = availableSizesMap.get(p.id) || []
    } else if (!hasVariantEntries && stock > 0 && Array.isArray(p.sizes)) {
      availableSizes = p.sizes.map((s: string) => ({ size: s, stock }))
    }

    return {
      ...p,
      stock,
      variants: allVariantsMap.get(p.id) || [],
      available_sizes: availableSizes,
      availableSizes: availableSizes,
    }
  })

  return NextResponse.json({ products: productsWithStock })
}

export async function POST(request: Request) {
  const supabase = createClient()

  if (!(await isAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { handle, title, description, price, compare_at_price, images, category, collection, tags, sizes, colors, is_new, is_bestseller, badge, fabric_composition, gsm, waist, length, model_info, what_you_get, size_fit_text, variants } = body

  if (!handle || !title || price === undefined) {
    return NextResponse.json({ error: 'Handle, title, and price are required' }, { status: 400 })
  }

  if (typeof price !== 'number' || price < 0) {
    return NextResponse.json({ error: 'Price must be a non-negative number' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      handle,
      title,
      description: description || '',
      price,
      compare_at_price: compare_at_price || null,
      images: images || [],
      category: category || '',
      collection: collection || [],
      tags: tags || [],
      sizes: sizes || [],
      colors: colors || [],
      is_new: is_new || false,
      is_bestseller: is_bestseller || false,
      badge: badge || null,
      fabric_composition: fabric_composition || '',
      gsm: gsm || '',
      waist: waist || '',
      length: length || '',
      model_info: model_info || '',
      what_you_get: what_you_get || [],
      size_fit_text: size_fit_text || '',
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A product with this handle already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }

  // Insert variants if provided (use admin client to bypass RLS)
  if (variants && Array.isArray(variants) && variants.length > 0) {
    const admin = createAdminClient()
    const variantRows = variants.map((v: any) => ({
      product_id: data.id,
      size: v.size,
      color: v.color,
      stock: v.stock || 0,
      sku: v.sku || null,
    }))
    await admin.from('product_variants').insert(variantRows)
  }

  return NextResponse.json({ product: data }, { status: 201 })
}
