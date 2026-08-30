import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marvvn.online'

async function getProducts() {
  try {
    const res = await fetch(`${baseUrl}/api/products`, { next: { revalidate: 3600 } })
    const data = await res.json()
    return data.products || []
  } catch {
    return []
  }
}

async function getBlogs() {
  try {
    const res = await fetch(`${baseUrl}/api/blogs`, { next: { revalidate: 3600 } })
    const data = await res.json()
    return data.blogs || []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts()
  const blogs = await getBlogs()

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/collections/women`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/collections/men`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/collections/kids`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/collections/accessories`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${baseUrl}/collections/new-arrivals`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/collections/best-sellers`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/blogs`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${baseUrl}/pages/about-us`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${baseUrl}/pages/faq`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${baseUrl}/pages/return-exchange-policy`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${baseUrl}/pages/terms-and-conditions`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.2 },
    { url: `${baseUrl}/policies/privacy-policy`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.2 },
    { url: `${baseUrl}/pages/get-in-touch`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${baseUrl}/track-order`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
  ]

  const productPages = products.map((product: any) => ({
    url: `${baseUrl}/products/${product.handle || product.slug}`,
    lastModified: new Date(product.updated_at || product.created_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const blogPages = blogs.map((blog: any) => ({
    url: `${baseUrl}/blogs/${blog.handle}`,
    lastModified: new Date(blog.created_at || Date.now()),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...productPages, ...blogPages]
}
