import { createClient } from '@/lib/supabase/server'

export async function checkInventory(productId: string, size: string, quantity: number): Promise<{ available: boolean; stock: number }> {
  const supabase = createClient()

  const { data: product } = await supabase
    .from('products')
    .select('stock, low_stock_threshold')
    .eq('id', productId)
    .single()

  if (!product) return { available: false, stock: 0 }

  const stock = product.stock || 0
  const threshold = product.low_stock_threshold || 5

  return {
    available: stock >= quantity,
    stock,
  }
}

export async function decrementStock(productId: string, quantity: number): Promise<boolean> {
  const supabase = createClient()

  const { data: product } = await supabase
    .from('products')
    .select('stock')
    .eq('id', productId)
    .single()

  if (!product || (product.stock || 0) < quantity) return false

  const { error } = await supabase
    .from('products')
    .update({ stock: (product.stock || 0) - quantity })
    .eq('id', productId)

  return !error
}

export async function checkLowStock(): Promise<{ id: string; title: string; stock: number }[]> {
  const supabase = createClient()

  const { data } = await supabase
    .from('products')
    .select('id, title, stock, low_stock_threshold')
    .lte('stock', 10)

  return (data || [])
    .filter((p: any) => (p.stock || 0) <= (p.low_stock_threshold || 5))
    .map((p: any) => ({ id: p.id, title: p.title, stock: p.stock || 0 }))
}
