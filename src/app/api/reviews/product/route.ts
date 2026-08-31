import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withErrorHandling, ApiError } from '@/lib/api-handler'

export async function GET() {
  return withErrorHandling(async () => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      throw new ApiError(500, 'Failed to fetch reviews')
    }

    return NextResponse.json({ reviews: data })
  })
}
