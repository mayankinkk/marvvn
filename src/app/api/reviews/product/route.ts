import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const handle = searchParams.get('handle')

  if (!handle) {
    return NextResponse.json({ error: 'Product handle is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_handle', handle)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ reviews: [] })
  }

  return NextResponse.json({ reviews: data })
}
