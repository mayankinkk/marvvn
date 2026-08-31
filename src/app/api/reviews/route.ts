import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withErrorHandling, ApiError } from '@/lib/api-handler'

export async function GET() {
  return withErrorHandling(async () => {
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
  })
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new ApiError(401, 'Unauthorized')
    }

    const body = await request.json()
    const { product_handle, text, rating, verified, photos } = body

    if (!product_handle || !text || !rating) {
      throw new ApiError(400, 'Product handle, text, and rating are required')
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new ApiError(400, 'Rating must be between 1 and 5')
    }

    const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).single()

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        name: profile?.name || 'Customer',
        email: user.email || null,
        text: text.trim(),
        rating,
        product_handle,
        verified: verified || false,
        photos: photos || [],
      })
      .select()
      .single()

    if (error) {
      throw new ApiError(500, 'Failed to create review')
    }

    return NextResponse.json({ review: data }, { status: 201 })
  })
}
