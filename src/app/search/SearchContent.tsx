'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductGrid from '@/components/ProductGrid'
import { useProducts } from '@/lib/hooks/useProducts'
import { useSettings } from '@/components/SettingsProvider'
import { getAllSearchResults } from '@/lib/search-utils'
import { parseMegaMenuFromSettings } from '@/lib/mega-menu-data'
import Link from 'next/link'
import { Folder } from 'lucide-react'

export default function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const { products } = useProducts()
  const settings = useSettings()

  const megaMenuData = parseMegaMenuFromSettings(settings?.mega_menu)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        router.replace(`/search?q=${encodeURIComponent(query)}`, { scroll: false })
      } else {
        router.replace('/search', { scroll: false })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, router])

  const results = useMemo(() => {
    return getAllSearchResults(products, megaMenuData, query, 50)
  }, [query, products, megaMenuData])

  const collectionResults = results.filter(r => r.type === 'collection')
  const matchedProducts = useMemo(() => {
    if (query.length < 2) return []
    const matchedHandles = new Set(results.filter(r => r.type === 'product').map(r => r.handle))
    return products.filter(p => matchedHandles.has(p.handle))
  }, [results, products, query])

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-8 lg:py-12">
        <h1 className="text-2xl lg:text-3xl font-display font-medium mb-6">Search</h1>

        <div className="max-w-xl mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, collections..."
            className="input-field"
            autoFocus
          />
        </div>

        {query.length >= 2 ? (
          results.length > 0 ? (
            <>
              <p className="text-sm text-marvvn-gray-500 mb-6">
                {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
              </p>

              {collectionResults.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-medium mb-4">Collections</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {collectionResults.map((result) => (
                      <Link
                        key={result.id}
                        href={result.href}
                        className="group"
                      >
                        <div className="aspect-[3/4] bg-marvvn-gray-50 mb-2 overflow-hidden relative flex items-center justify-center">
                          <Folder className="w-8 h-8 text-marvvn-gray-400" />
                        </div>
                        <h4 className="text-sm font-medium truncate group-hover:text-marvvn-gray-600 transition-colors">
                          {result.title}
                        </h4>
                        <p className="text-xs text-marvvn-gray-400">Collection</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {matchedProducts.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium mb-4">Products</h2>
                  <ProductGrid products={matchedProducts} columns={4} />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-marvvn-gray-500 text-lg mb-2">No results found for &quot;{query}&quot;</p>
              <p className="text-sm text-marvvn-gray-400">Try searching with different keywords</p>
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <p className="text-marvvn-gray-400">Type at least 2 characters to search</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
