import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withErrorHandling, ApiError } from '@/lib/api-handler'

export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')
    const email = searchParams.get('email')

    if (!orderId || !email) {
      throw new ApiError(400, 'Order ID and email are required')
    }

    const supabase = createClient()

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total,
        created_at,
        shipping_address,
        order_items (
          id,
          quantity,
          size,
          products ( title, handle, image_url )
        )
      `)
      .eq('id', orderId)
      .eq('shipping_address->>email', email)
      .single()

    if (error || !order) {
      throw new ApiError(404, 'Order not found. Please check your order ID and email.')
    }

    return NextResponse.json({ order })
  })
}
