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

    const { data: settings } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'valid_coupons')
      .single()

    if (!settings?.value) {
      return NextResponse.json({ valid: false })
    }

    let coupons: any[]
    try {
      coupons = JSON.parse(settings.value)
    } catch {
      return NextResponse.json({ valid: false })
    }

    const coupon = coupons.find(
      (c: any) => c.code?.toUpperCase() === upperCode && c.active !== false
    )

    if (!coupon) {
      return NextResponse.json({ valid: false })
    }

    // Check expiry
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, reason: 'expired' })
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return NextResponse.json({ valid: false, reason: 'limit_reached' })
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type || 'percentage',
      discount_value: coupon.discount_value || 0,
      min_order: coupon.min_order || 0,
    })
  } catch (error) {
    console.error('Coupon validation error:', error)
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}
