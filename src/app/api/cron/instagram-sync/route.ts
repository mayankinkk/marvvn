import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncAllProducts } from '@/lib/instagram-commerce'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()

  try {
    const { data: products } = await supabase
      .from('products')
      .select('id, title, description, price, stock, images, category, handle')
      .eq('active', true)

    if (!products || products.length === 0) {
      return NextResponse.json({ message: 'No products to sync', synced: 0 })
    }

    const result = await syncAllProducts(products)

    await supabase.from('instagram_sync_log').insert({
      synced: result.synced,
      failed: result.failed,
      errors: result.errors,
      completed_at: new Date().toISOString(),
    })

    return NextResponse.json({
      message: 'Sync completed',
      ...result,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
