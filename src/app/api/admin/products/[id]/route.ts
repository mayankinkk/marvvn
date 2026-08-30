import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function isAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin || false
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()

  if (!(await isAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()

  if (error) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json({ product: data })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()

  if (!(await isAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { handle, title, description, price, compare_at_price, images, category, collection, tags, sizes, colors, is_new, is_bestseller, badge, fabric_composition, gsm, waist, length, model_info, what_you_get, size_fit_text } = body

  if (!handle || !title || price === undefined) {
    return NextResponse.json({ error: 'Handle, title, and price are required' }, { status: 400 })
  }

  if (typeof price !== 'number' || price < 0) {
    return NextResponse.json({ error: 'Price must be a non-negative number' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('products')
    .update({
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
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A product with this handle already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }

  return NextResponse.json({ product: data })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()

  if (!(await isAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
