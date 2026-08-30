import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncProductToCatalog, syncAllProducts, getCatalogProducts } from '@/lib/instagram-commerce'

async function isAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin || false
}

// GET: Check sync status
export async function GET() {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const catalogProducts = await getCatalogProducts()

    const { data: localProducts } = await supabase
      .from('products')
      .select('id, title, handle, price, stock, images')

    const catalogRetailerIds = new Set(
      catalogProducts.map((p: any) => p.retailer_id).filter(Boolean)
    )

    const syncStatus = (localProducts || []).map((p: any) => {
      const retailerId = `marvvn_${p.id}`
      const inCatalog = catalogRetailerIds.has(retailerId)
      return {
        id: p.id,
        title: p.title,
        handle: p.handle,
        price: p.price,
        stock: p.stock,
        image: p.images?.[0] || '',
        synced: inCatalog,
      }
    })

    const syncedCount = syncStatus.filter(p => p.synced).length
    const notSyncedCount = syncStatus.filter(p => !p.synced).length

    return NextResponse.json({
      catalogProductCount: catalogProducts.length,
      localProductCount: localProducts?.length || 0,
      syncedCount,
      notSyncedCount,
      products: syncStatus,
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message || 'Failed to check sync status',
      catalogProductCount: 0,
      localProductCount: 0,
      syncedCount: 0,
      notSyncedCount: 0,
      products: [],
    })
  }
}

// POST: Sync products
export async function POST(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { productId, syncAll } = body

  try {
    if (syncAll) {
      const { data: products } = await supabase
        .from('products')
        .select('id, title, description, price, stock, images, category, handle')
        .eq('active', true)

      if (!products) return NextResponse.json({ error: 'No products found' }, { status: 400 })

      const result = await syncAllProducts(products)
      return NextResponse.json(result)
    }

    if (productId) {
      const { data: product } = await supabase
        .from('products')
        .select('id, title, description, price, stock, images, category, handle')
        .eq('id', productId)
        .single()

      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

      const result = await syncProductToCatalog(product)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'productId or syncAll required' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
