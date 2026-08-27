'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductGrid from '@/components/ProductGrid'
import { useProducts } from '@/lib/hooks/useProducts'

export default function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const { products } = useProducts()

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
    if (query.length < 2) return []
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase()) ||
        p.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
        p.category?.toLowerCase().includes(query.toLowerCase())
    )
  }, [query, products])

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
            placeholder="Search for products..."
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
              <ProductGrid products={results} columns={4} />
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
