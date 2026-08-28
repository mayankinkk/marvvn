import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    return NextResponse.json({ reviews: [] })
  }

  return NextResponse.json({ reviews: data })
}
