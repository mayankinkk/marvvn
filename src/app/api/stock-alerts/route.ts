import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { withErrorHandling, ApiError } from '@/lib/api-handler'

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rl = await rateLimit(`stock-alerts:${ip}`, 5, 60000)
    if (!rl.success) {
      throw new ApiError(429, 'Too many requests. Please try again later.')
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { productId, email } = await request.json()

    if (!productId) {
      throw new ApiError(400, 'Product ID is required')
    }

    if (!email || typeof email !== 'string') {
      throw new ApiError(400, 'Email is required')
    }

    const { error } = await supabase
      .from('stock_alerts')
      .upsert({
        user_id: user?.id || null,
        product_id: productId,
        email: email.toLowerCase().trim(),
        notified: false,
      }, { onConflict: 'user_id,product_id' })

    if (error) {
      throw new ApiError(500, 'Failed to sign up for stock alert')
    }

    return NextResponse.json({ success: true })
  })
}
