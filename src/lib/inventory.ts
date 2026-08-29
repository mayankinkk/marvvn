import { createAdminClient } from '@/lib/supabase/admin'

export async function checkInventory(productId: string, size: string, quantity: number): Promise<{ available: boolean; stock: number }> {
  const admin = createAdminClient()

  const { data: product } = await admin
    .from('products')
    .select('stock, low_stock_threshold')
    .eq('id', productId)
    .single()

  if (!product) return { available: false, stock: 0 }

  const stock = product.stock || 0

  return {
    available: stock >= quantity,
    stock,
  }
}

export async function decrementStock(productId: string, quantity: number): Promise<boolean> {
  const admin = createAdminClient()

  const { data: product } = await admin
    .from('products')
    .select('stock, low_stock_threshold, title')
    .eq('id', productId)
    .single()

  if (!product || (product.stock || 0) < quantity) return false

  const newStock = (product.stock || 0) - quantity
  const { error } = await admin
    .from('products')
    .update({ stock: newStock })
    .eq('id', productId)

  if (!error) {
    // Check if low stock and trigger alert
    const threshold = product.low_stock_threshold || 5
    if (newStock <= threshold && newStock > 0) {
      triggerLowStockAlert().catch(console.error)
    }
    // Check if out of stock and trigger back-in-stock check
    if (newStock === 0) {
      triggerBackInStockCheck(productId).catch(console.error)
    }
  }

  return !error
}

async function triggerLowStockAlert() {
  try {
    const { sendLowStockAlert } = await import('@/lib/email')
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
        await sendLowStockAlert(adminEmail, lowStock)
      }
    }
  } catch (e) {
    console.error('Low stock alert failed:', e)
  }
}

async function triggerBackInStockCheck(productId: string) {
  try {
    const { sendBackInStockAlert } = await import('@/lib/email')
    const admin = createAdminClient()

    const { data: alerts } = await admin
      .from('stock_alerts')
      .select('id, email')
      .eq('product_id', productId)
      .eq('notified', false)

    if (!alerts || alerts.length === 0) return

    const { data: product } = await admin
      .from('products')
      .select('title, handle, stock')
      .eq('id', productId)
      .single()

    if (!product || (product.stock || 0) > 0) return

    for (const alert of alerts) {
      await sendBackInStockAlert(alert.email, product.title, product.handle).catch(console.error)
    }

    await admin
      .from('stock_alerts')
      .update({ notified: true })
      .eq('product_id', productId)
  } catch (e) {
    console.error('Back-in-stock check failed:', e)
  }
}

export async function checkLowStock(): Promise<{ id: string; title: string; stock: number }[]> {
  const admin = createAdminClient()

  const { data } = await admin
    .from('products')
    .select('id, title, stock, low_stock_threshold')
    .lte('stock', 10)

  return (data || [])
    .filter((p: any) => (p.stock || 0) <= (p.low_stock_threshold || 5))
    .map((p: any) => ({ id: p.id, title: p.title, stock: p.stock || 0 }))
}
