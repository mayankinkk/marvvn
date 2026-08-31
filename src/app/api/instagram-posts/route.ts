import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: posts, error } = await supabase
      .from('instagram_posts')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(6)

    if (error) {
      return NextResponse.json({ posts: [] })
    }

    return NextResponse.json({ posts: posts || [] })
  } catch (error) {
    return NextResponse.json({ posts: [] })
  }
}
