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

  const { data } = await supabase
    .from('products')
    .select('id, title, stock, low_stock_threshold')
    .lte('stock', 10)

  const lowStock = (data || [])
    .filter((p: any) => (p.stock || 0) <= (p.low_stock_threshold || 5))
    .map((p: any) => ({
      id: p.id,
      title: p.title,
      stock: p.stock || 0,
      threshold: p.low_stock_threshold || 5,
    }))

  return NextResponse.json({ products: lowStock })
}
