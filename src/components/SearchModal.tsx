'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, X, ArrowRight } from 'lucide-react'
import { products } from '@/lib/data'
import { formatPrice } from '@/lib/utils'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<typeof products>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    const filtered = products.filter(
      (p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
        p.category.toLowerCase().includes(query.toLowerCase())
    )
    setResults(filtered.slice(0, 8))
  }, [query])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute top-0 left-0 right-0 bg-white shadow-lg animate-slide-down">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-marvnn-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search MARVNN"
              className="flex-1 text-lg focus:outline-none"
            />
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-marvnn-gray-50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {results.length > 0 && (
            <div className="mt-4 border-t pt-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.handle}`}
                    onClick={onClose}
                    className="group"
                  >
                    <div className="aspect-[3/4] bg-marvnn-gray-50 mb-2 overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h4 className="text-sm font-medium truncate group-hover:text-marvnn-gray-600 transition-colors">
                      {product.title}
                    </h4>
                    <p className="text-sm text-marvnn-gray-500">{formatPrice(product.price)}</p>
                  </Link>
                ))}
              </div>
              {query.length >= 2 && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 mt-6 py-3 text-sm font-medium border border-marvnn-gray-300 hover:border-marvnn-black transition-colors"
                >
                  View all results <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          )}

          {query.length >= 2 && results.length === 0 && (
            <div className="mt-4 border-t pt-8 text-center">
              <p className="text-marvnn-gray-500">No results found for &quot;{query}&quot;</p>
            </div>
          )}

          {query.length < 2 && (
            <div className="mt-4 border-t pt-4">
              <p className="text-xs text-marvnn-gray-400 uppercase tracking-wider mb-3">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {['Oversized T-Shirt', 'Joggers', 'Marvel', 'Cargos', 'Caps'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 text-sm border border-marvnn-gray-300 hover:border-marvnn-black transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}