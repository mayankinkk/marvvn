import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'
import { withErrorHandling, ApiError } from '@/lib/api-handler'

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rl = await rateLimit(`newsletter:${ip}`, 3, 60000)
    if (!rl.success) {
      throw new ApiError(429, 'Too many requests. Please try again later.')
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError(400, 'Valid email is required')
    }

    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email: email.toLowerCase().trim(), subscribed_at: new Date().toISOString() }, { onConflict: 'email' })

    if (error) {
      console.error('Newsletter subscribe error:', error.message)
      throw new ApiError(500, 'Failed to subscribe')
    }

    return NextResponse.json({ success: true, message: 'Thank you for subscribing!' })
  })
}
