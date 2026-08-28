import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { collections, blogPosts } from '@/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://marvvn.online'

  let products: { handle: string }[] = []
  let blogs: { handle: string; created_at: string }[] = []
  try {
    const supabase = createClient()
    const { data: productData } = await supabase.from('products').select('handle')
    products = productData || []

    const { data: blogData } = await supabase.from('blogs').select('handle, created_at').eq('published', true)
    blogs = blogData || []
  } catch {
    products = []
    blogs = []
  }

  const home = {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }

  const collectionPages = collections.map((collection) => ({
    url: `${baseUrl}/collections/${collection.handle}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const productPages = products.map((product) => ({
    url: `${baseUrl}/products/${product.handle}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const dbBlogPages = blogs.map((blog) => ({
    url: `${baseUrl}/blogs/bonkers-corner/${blog.handle}`,
    lastModified: new Date(blog.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const fallbackBlogPages = blogs.length === 0
    ? blogPosts.map((post) => ({
        url: `${baseUrl}/blogs/bonkers-corner/${post.handle}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    : []

  const staticPages = [
    { url: `${baseUrl}/pages/about-us`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/pages/get-in-touch`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/pages/faq`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/pages/store-locator`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/pages/return-exchange-policy`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${baseUrl}/pages/terms-and-conditions`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${baseUrl}/policies/privacy-policy`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.6 },
  ]

  return [home, ...collectionPages, ...productPages, ...dbBlogPages, ...fallbackBlogPages, ...staticPages]
}
