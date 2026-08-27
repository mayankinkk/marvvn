import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function isAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin || false
}

// Coupons stored in a simple table or as JSON. For now, use a coupons table.
// Run: CREATE TABLE IF NOT EXISTS coupons (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, code TEXT UNIQUE NOT NULL, discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')), discount_value NUMERIC(10,2) NOT NULL, min_cart NUMERIC(10,2) DEFAULT 0, max_uses INTEGER, used_count INTEGER DEFAULT 0, active BOOLEAN DEFAULT true, expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());

export async function GET() {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ coupons: data })
}

export async function POST(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { code, discount_type, discount_value, min_cart, max_uses, expires_at } = body

  const { data, error } = await supabase
    .from('coupons')
    .insert({
      code: code.toUpperCase(),
      discount_type,
      discount_value,
      min_cart: min_cart || 0,
      max_uses: max_uses || null,
      expires_at: expires_at || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ coupon: data }, { status: 201 })
}

export async function PUT(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { id, code, discount_type, discount_value, min_cart, max_uses, active, expires_at } = body

  const { data, error } = await supabase
    .from('coupons')
    .update({
      code: code?.toUpperCase(),
      discount_type,
      discount_value,
      min_cart,
      max_uses,
      active,
      expires_at,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ coupon: data })
}

export async function DELETE(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase.from('coupons').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
