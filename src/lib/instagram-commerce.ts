const GRAPH_API_URL = 'https://graph.facebook.com/v19.0'

interface MetaProduct {
  id?: string
  title: string
  description: string
  availability: 'in stock' | 'out of stock' | 'preorder'
  condition: 'new' | 'refurbished' | 'used'
  price: string
  link: string
  image_link: string
  brand: string
  item_group_id: string
  inventory: number
  status: 'active' | 'archived'
}

interface SyncResult {
  success: boolean
  synced: number
  failed: number
  errors: string[]
}

export async function getAccessToken(): Promise<string> {
  const token = process.env.META_ACCESS_TOKEN
  if (!token) throw new Error('META_ACCESS_TOKEN not configured')
  return token
}

export async function getCatalogId(): Promise<string> {
  const id = process.env.META_CATALOG_ID
  if (!id) throw new Error('META_CATALOG_ID not configured')
  return id
}

export async function syncProductToCatalog(product: {
  id: string
  title: string
  description: string
  price: number
  stock: number
  images: string[]
  category: string
  handle: string
}): Promise<{ success: boolean; retailerId?: string; error?: string }> {
  const accessToken = await getAccessToken()
  const catalogId = await getCatalogId()
  const baseUrl = 'https://marvvn.online'

  const retailerId = `marvvn_${product.id}`
  const availability = product.stock > 0 ? 'in stock' : 'out of stock'

  const productData: Record<string, any> = {
    retailer_id: retailerId,
    title: product.title,
    description: product.description || product.title,
    availability,
    condition: 'new',
    price: `${product.price} INR`,
    link: `${baseUrl}/products/${product.handle}`,
    image_link: product.images[0] ? (product.images[0].startsWith('http') ? product.images[0] : `${baseUrl}${product.images[0]}`) : '',
    brand: 'MARVVN',
    item_group_id: product.id,
    inventory: product.stock,
    status: 'active',
  }

  try {
    const res = await fetch(
      `${GRAPH_API_URL}/${catalogId}/products?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      }
    )

    const data = await res.json()

    if (data.id) {
      return { success: true, retailerId }
    }

    return { success: false, error: data.error?.message || 'Unknown error' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateProductInCatalog(retailerId: string, updates: Partial<MetaProduct>): Promise<{ success: boolean; error?: string }> {
  const accessToken = await getAccessToken()
  const catalogId = await getCatalogId()

  try {
    const res = await fetch(
      `${GRAPH_API_URL}/${catalogId}/products?retailer_ids=[${retailerId}]&access_token=${accessToken}`,
      {
        method: 'GET',
      }
    )

    const data = await res.json()
    const existing = data.data?.[0]

    if (!existing?.id) {
      return { success: false, error: 'Product not found in catalog' }
    }

    const updateRes = await fetch(
      `${GRAPH_API_URL}/${existing.id}?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }
    )

    const updateData = await updateRes.json()
    return { success: !!updateData.success }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteProductFromCatalog(retailerId: string): Promise<{ success: boolean; error?: string }> {
  const accessToken = await getAccessToken()
  const catalogId = await getCatalogId()

  try {
    const res = await fetch(
      `${GRAPH_API_URL}/${catalogId}/products?retailer_ids=[${retailerId}]&access_token=${accessToken}`,
      { method: 'GET' }
    )

    const data = await res.json()
    const existing = data.data?.[0]

    if (!existing?.id) {
      return { success: true }
    }

    const deleteRes = await fetch(
      `${GRAPH_API_URL}/${existing.id}?access_token=${accessToken}`,
      { method: 'DELETE' }
    )

    const deleteData = await deleteRes.json()
    return { success: !!deleteData.success }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getCatalogProducts(): Promise<any[]> {
  const accessToken = await getAccessToken()
  const catalogId = await getCatalogId()

  try {
    const res = await fetch(
      `${GRAPH_API_URL}/${catalogId}/products?access_token=${accessToken}&limit=500`
    )
    const data = await res.json()
    return data.data || []
  } catch {
    return []
  }
}

export async function syncAllProducts(products: {
  id: string
  title: string
  description: string
  price: number
  stock: number
  images: string[]
  category: string
  handle: string
}[]): Promise<SyncResult> {
  let synced = 0
  let failed = 0
  const errors: string[] = []

  for (const product of products) {
    const result = await syncProductToCatalog(product)
    if (result.success) {
      synced++
    } else {
      failed++
      errors.push(`${product.title}: ${result.error}`)
    }
  }

  return { success: failed === 0, synced, failed, errors }
}
