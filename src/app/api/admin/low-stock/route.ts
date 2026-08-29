import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendLowStockAlert } from '@/lib/email'

export async function GET() {
  const admin = createAdminClient()

  const { data: products } = await admin
    .from('products')
    .select('id, title, stock, low_stock_threshold')
    .lte('stock', 10)

  const lowStock = (products || [])
    .filter((p: any) => (p.stock || 0) <= (p.low_stock_threshold || 5))
    .map((p: any) => ({ id: p.id, title: p.title, stock: p.stock || 0 }))

  if (lowStock.length > 0) {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.STORE_EMAIL
    if (adminEmail) {
      await sendLowStockAlert(adminEmail, lowStock).catch(console.error)
    }
  }

  return NextResponse.json({ lowStock })
}
