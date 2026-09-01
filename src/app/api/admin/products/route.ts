import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  return NextResponse.json({ products: data })
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

  // Insert variants if provided
  if (variants && Array.isArray(variants) && variants.length > 0) {
    const variantRows = variants.map((v: any) => ({
      product_id: data.id,
      size: v.size,
      color: v.color,
      stock: v.stock || 0,
      sku: v.sku || null,
    }))
    await supabase.from('product_variants').insert(variantRows)
  }

  return NextResponse.json({ product: data }, { status: 201 })
}
