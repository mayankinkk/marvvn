import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  const admin = createAdminClient()

  let query = admin
    .from('order_items')
    .select('size, products!inner(category)')
    .not('size', 'is', null)

  if (category) {
    query = query.eq('products.category', category)
  }

  const { data } = await query

  const sizeCount: Record<string, number> = {}
  ;(data || []).forEach((item: any) => {
    if (item.size) {
      sizeCount[item.size] = (sizeCount[item.size] || 0) + 1
    }
  })

  const sizes = Object.entries(sizeCount)
    .map(([size, count]) => ({ size, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return NextResponse.json({ sizes })
}
