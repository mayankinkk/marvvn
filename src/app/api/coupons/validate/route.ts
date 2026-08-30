import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 })
    }

    const supabase = createClient()
    const upperCode = code.toUpperCase().trim()

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('code, discount_type, discount_value, min_cart, max_uses, used_count, active, expires_at')
      .eq('code', upperCode)
      .eq('active', true)
      .single()

    if (error || !coupon) {
      return NextResponse.json({ valid: false })
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, reason: 'expired' })
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ valid: false, reason: 'limit_reached' })
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order: coupon.min_cart || 0,
    })
  } catch (error) {
    console.error('Coupon validation error:', error)
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}
