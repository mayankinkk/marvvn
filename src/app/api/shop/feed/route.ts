import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()

  const { data: products } = await supabase
    .from('products')
    .select('id, title, description, price, images, slug, category, sizes, colors, stock')
    .eq('active', true)
    .gt('stock', 0)

  if (!products || products.length === 0) {
    return new NextResponse('No products available', { status: 404 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marvvn.online'

  const csvRows = [
    'id,title,description,availability,condition,price,currency,image_link,link,brand,product_type,item_group_id,color,size,stock',
  ]

  for (const product of products) {
    const availability = product.stock > 0 ? 'in stock' : 'out of stock'
    const condition = 'new'
    const priceVal = `INR ${product.price}`
    const imageUrl = product.images?.[0] || ''
    const productUrl = `${baseUrl}/products/${product.slug}`

    const colors = product.colors?.length ? product.colors : ['One Color']
    const sizes = product.sizes?.length ? product.sizes : ['One Size']

    for (const color of colors) {
      for (const size of sizes) {
        const variantId = `${product.id}-${color}-${size}`.replace(/\s+/g, '-').toLowerCase()
        csvRows.push(
          [
            variantId,
            `"${product.title.replace(/"/g, '""')}"`,
            `"${(product.description || '').replace(/"/g, '""').slice(0, 5000)}"`,
            availability,
            condition,
            product.price,
            'INR',
            `"${imageUrl}"`,
            `"${productUrl}"`,
            'MARVVN',
            product.category || 'clothing',
            product.category || 'clothing',
            `"${color}"`,
            `"${size}"`,
            product.stock,
          ].join(',')
        )
      }
    }
  }

  return new NextResponse(csvRows.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="marvvn-instagram-product-feed-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
