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
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ products: data })
}

export async function POST(request: Request) {
  const supabase = createClient()

  if (!(await isAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { handle, title, description, price, compare_at_price, images, category, collection, tags, sizes, colors, is_new, is_bestseller, badge } = body

  const { data, error } = await supabase
    .from('products')
    .insert({
      handle,
      title,
      description,
      price,
      compare_at_price: compare_at_price || null,
      images: images || [],
      category,
      collection: collection || [],
      tags: tags || [],
      sizes: sizes || [],
      colors: colors || [],
      is_new: is_new || false,
      is_bestseller: is_bestseller || false,
      badge: badge || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ product: data }, { status: 201 })
}
