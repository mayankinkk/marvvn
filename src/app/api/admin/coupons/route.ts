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

  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  return NextResponse.json({ coupons: data })
}

export async function POST(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { code, discount_type, discount_value, min_cart, max_uses, expires_at } = body

  if (!code || !discount_type || discount_value === undefined) {
    return NextResponse.json({ error: 'Code, discount type, and value are required' }, { status: 400 })
  }

  if (!['percentage', 'fixed'].includes(discount_type)) {
    return NextResponse.json({ error: 'Discount type must be percentage or fixed' }, { status: 400 })
  }

  if (typeof discount_value !== 'number' || discount_value <= 0) {
    return NextResponse.json({ error: 'Discount value must be a positive number' }, { status: 400 })
  }

  if (discount_type === 'percentage' && discount_value > 100) {
    return NextResponse.json({ error: 'Percentage discount cannot exceed 100%' }, { status: 400 })
  }

  if (min_cart !== undefined && (typeof min_cart !== 'number' || min_cart < 0)) {
    return NextResponse.json({ error: 'Min cart must be a non-negative number' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('coupons')
    .insert({
      code: code.toUpperCase().trim(),
      discount_type,
      discount_value,
      min_cart: min_cart || 0,
      max_uses: max_uses || null,
      expires_at: expires_at || null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A coupon with this code already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
  }
  return NextResponse.json({ coupon: data }, { status: 201 })
}

export async function PUT(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { id, code, discount_type, discount_value, min_cart, max_uses, active, expires_at } = body

  if (!id) return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 })

  const updates: Record<string, any> = {}
  if (code !== undefined) updates.code = code.toUpperCase().trim()
  if (discount_type !== undefined) updates.discount_type = discount_type
  if (discount_value !== undefined) updates.discount_value = discount_value
  if (min_cart !== undefined) updates.min_cart = min_cart
  if (max_uses !== undefined) updates.max_uses = max_uses
  if (active !== undefined) updates.active = active
  if (expires_at !== undefined) updates.expires_at = expires_at

  const { data, error } = await supabase
    .from('coupons')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
  return NextResponse.json({ coupon: data })
}

export async function DELETE(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase.from('coupons').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 })
  return NextResponse.json({ success: true })
}
