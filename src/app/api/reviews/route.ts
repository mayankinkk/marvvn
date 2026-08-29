import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    return NextResponse.json({ reviews: [] })
  }

  return NextResponse.json({ reviews: data })
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { product_handle, text, rating, verified, photos } = body

  if (!product_handle || !text || !rating) {
    return NextResponse.json({ error: 'Product handle, text, and rating are required' }, { status: 400 })
  }

  const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).single()

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      name: profile?.name || 'Customer',
      email: user.email || null,
      text,
      rating,
      product_handle,
      verified: verified || false,
      photos: photos || [],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  return NextResponse.json({ review: data }, { status: 201 })
}
