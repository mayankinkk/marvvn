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
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  return NextResponse.json({ reviews: data })
}

export async function POST(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { name, email, text, rating, product_handle, verified, featured } = body

  if (!name || !text || !rating) {
    return NextResponse.json({ error: 'Name, text, and rating are required' }, { status: 400 })
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      name,
      email: email || null,
      text,
      rating,
      product_handle: product_handle || null,
      verified: verified || false,
      featured: featured || false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  return NextResponse.json({ review: data }, { status: 201 })
}

export async function PUT(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { id, name, email, text, rating, product_handle, verified, featured } = body

  if (!id) return NextResponse.json({ error: 'Review ID is required' }, { status: 400 })

  const updates: Record<string, any> = {}
  if (name !== undefined) updates.name = name
  if (email !== undefined) updates.email = email
  if (text !== undefined) updates.text = text
  if (rating !== undefined) updates.rating = rating
  if (product_handle !== undefined) updates.product_handle = product_handle
  if (verified !== undefined) updates.verified = verified
  if (featured !== undefined) updates.featured = featured

  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  return NextResponse.json({ review: data })
}

export async function DELETE(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase.from('reviews').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  return NextResponse.json({ success: true })
}
