import { Product, MegaMenuSection } from './types'

export interface SearchResult {
  type: 'product' | 'collection'
  id: string
  title: string
  handle: string
  image?: string
  price?: number
  category?: string
  href: string
}

export function searchProducts(
  products: Product[],
  query: string,
  limit = 8
): SearchResult[] {
  if (!query || query.length < 2) return []

  const q = query.toLowerCase().trim()
  const results: SearchResult[] = []

  for (const p of products) {
    const titleMatch = p.title.toLowerCase().includes(q)
    const descMatch = p.description?.toLowerCase().includes(q)
    const tagMatch = p.tags?.some((t) => t.toLowerCase().includes(q))
    const catMatch = p.category?.toLowerCase().includes(q)
    const colMatch = p.collection?.some((c) => c.toLowerCase().includes(q))
    const handleMatch = p.handle.toLowerCase().includes(q)

    if (titleMatch || descMatch || tagMatch || catMatch || colMatch || handleMatch) {
      results.push({
        type: 'product',
        id: p.id,
        title: p.title,
        handle: p.handle,
        image: p.images?.[0],
        price: p.price,
        category: p.category,
        href: `/products/${p.handle}`,
      })
    }

    if (results.length >= limit) break
  }

  return results
}

export function searchCollections(
  megaMenuData: MegaMenuSection[],
  query: string
): SearchResult[] {
  if (!query || query.length < 2) return []

  const q = query.toLowerCase().trim()
  const seen = new Set<string>()
  const results: SearchResult[] = []

  for (const section of megaMenuData) {
    for (const col of section.columns) {
      for (const link of col.links) {
        const labelMatch = link.label.toLowerCase().includes(q)
        const hrefMatch = link.href.toLowerCase().includes(q)

        if (labelMatch || hrefMatch) {
          if (!seen.has(link.href)) {
            seen.add(link.href)
            results.push({
              type: 'collection',
              id: link.href,
              title: link.label,
              handle: link.href.replace('/collections/', ''),
              href: link.href,
            })
          }
        }
      }
    }
  }

  return results
}

export function getAllSearchResults(
  products: Product[],
  megaMenuData: MegaMenuSection[],
  query: string,
  limit = 8
): SearchResult[] {
  if (!query || query.length < 2) return []

  const collections = searchCollections(megaMenuData, query)
  const productsResults = searchProducts(products, query, limit)

  return [...collections, ...productsResults].slice(0, limit)
}
