import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rl = rateLimit(`stock-alerts:${ip}`, 5, 60000)
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { productId, email } = await request.json()

  if (!productId || !email) {
    return NextResponse.json({ error: 'Product ID and email required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('stock_alerts')
    .upsert({
      user_id: user?.id || null,
      product_id: productId,
      email,
      notified: false,
    }, { onConflict: 'user_id,product_id' })

  if (error) return NextResponse.json({ error: 'Failed to sign up' }, { status: 500 })

  return NextResponse.json({ success: true })
}
