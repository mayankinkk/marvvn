import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://marvvn.online'

export async function GET() {
  try {
    const supabase = createClient()

    const [productsRes, blogsRes, collectionsRes] = await Promise.allSettled([
      supabase
        .from('products')
        .select('handle, updated_at, created_at')
        .order('updated_at', { ascending: false })
        .limit(5000),
      supabase
        .from('blogs')
        .select('handle, updated_at, created_at')
        .order('updated_at', { ascending: false })
        .limit(1000),
      supabase
        .from('collections')
        .select('handle, updated_at')
        .order('updated_at', { ascending: false })
        .limit(500),
    ])

    const products = productsRes.status === 'fulfilled' ? productsRes.value.data || [] : []
    const blogs = blogsRes.status === 'fulfilled' ? blogsRes.value.data || [] : []
    const collections = collectionsRes.status === 'fulfilled' ? collectionsRes.value.data || [] : []

    const staticPages = [
      { url: '', changefreq: 'daily', priority: '1.0' },
      { url: '/collections/new-arrivals', changefreq: 'daily', priority: '0.9' },
      { url: '/collections/best-sellers', changefreq: 'weekly', priority: '0.9' },
      { url: '/collections/women', changefreq: 'weekly', priority: '0.8' },
      { url: '/collections/men', changefreq: 'weekly', priority: '0.8' },
      { url: '/collections/accessories', changefreq: 'weekly', priority: '0.7' },
      { url: '/blogs', changefreq: 'weekly', priority: '0.7' },
      { url: '/search', changefreq: 'monthly', priority: '0.5' },
      { url: '/pages/about-us', changefreq: 'monthly', priority: '0.6' },
      { url: '/pages/faq', changefreq: 'monthly', priority: '0.6' },
      { url: '/pages/get-in-touch', changefreq: 'monthly', priority: '0.5' },
      { url: '/pages/terms-and-conditions', changefreq: 'yearly', priority: '0.3' },
      { url: '/policies/privacy-policy', changefreq: 'yearly', priority: '0.3' },
      { url: '/pages/return-exchange-policy', changefreq: 'yearly', priority: '0.3' },
    ]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${staticPages.map((page) => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}

  ${collections.map((col) => `  <url>
    <loc>${BASE_URL}/collections/${col.handle}</loc>
    <lastmod>${col.updated_at ? new Date(col.updated_at).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}

  ${products.map((p) => `  <url>
    <loc>${BASE_URL}/products/${p.handle}</loc>
    <lastmod>${p.updated_at ? new Date(p.updated_at).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}

  ${blogs.map((b) => `  <url>
    <loc>${BASE_URL}/blogs/${b.handle}</loc>
    <lastmod>${b.updated_at ? new Date(b.updated_at).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`
    return new NextResponse(fallbackXml, {
      headers: { 'Content-Type': 'application/xml' },
    })
  }
}
