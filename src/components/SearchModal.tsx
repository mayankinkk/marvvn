'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, ArrowRight, Folder } from 'lucide-react'
import { useProducts } from '@/lib/hooks/useProducts'
import { useSettings } from '@/components/SettingsProvider'
import { getAllSearchResults, SearchResult } from '@/lib/search-utils'
import { formatPrice } from '@/lib/utils'
import { parseMegaMenuFromSettings } from '@/lib/mega-menu-data'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const { products } = useProducts()
  const settings = useSettings()
  const [results, setResults] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const megaMenuData = useMemo(
    () => parseMegaMenuFromSettings(settings?.mega_menu),
    [settings?.mega_menu]
  )

  const popularSearches = (() => {
    const raw = settings?.popular_searches
    if (Array.isArray(raw) && raw.length > 0) return raw
    if (typeof raw === 'string' && raw.startsWith('[')) {
      try { return JSON.parse(raw) } catch {}
    }
    return ['Oversized T-Shirt', 'Joggers', 'Marvel', 'Cargos', 'Caps']
  })()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.length < 2) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(() => {
      const allResults = getAllSearchResults(products, megaMenuData, query, 8)
      setResults(allResults)
    }, 250)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, products, megaMenuData])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute top-0 left-0 right-0 bg-white shadow-lg animate-slide-down">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-marvvn-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search MARVVN"
              className="flex-1 text-lg focus:outline-none"
            />
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-marvvn-gray-50 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {results.length > 0 && (
            <div className="mt-4 border-t pt-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {results.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={result.href}
                    onClick={onClose}
                    className="group"
                  >
                    <div className="aspect-[3/4] bg-marvvn-gray-50 mb-2 overflow-hidden relative">
                      {result.type === 'collection' ? (
                        <div className="flex items-center justify-center h-full w-full bg-marvvn-gray-100">
                          <Folder className="w-8 h-8 text-marvvn-gray-400" />
                        </div>
                      ) : result.image ? (
                        <Image
                          src={result.image}
                          alt={result.title}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-marvvn-gray-100">
                          <Search className="w-8 h-8 text-marvvn-gray-300" />
                        </div>
                      )}
                    </div>
                    <h4 className="text-sm font-medium truncate group-hover:text-marvvn-gray-600 transition-colors">
                      {result.title}
                    </h4>
                    {result.price !== undefined && (
                      <p className="text-sm text-marvvn-gray-500">{formatPrice(result.price)}</p>
                    )}
                    {result.type === 'collection' && (
                      <p className="text-xs text-marvvn-gray-400">Collection</p>
                    )}
                  </Link>
                ))}
              </div>
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 mt-6 py-3 text-sm font-medium border border-marvvn-gray-300 hover:border-marvvn-black transition-colors"
              >
                View all results <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {query.length >= 2 && results.length === 0 && (
            <div className="mt-4 border-t pt-8 text-center">
              <p className="text-marvvn-gray-500">No results found for &quot;{query}&quot;</p>
            </div>
          )}

          {query.length < 2 && (
            <div className="mt-4 border-t pt-4">
              <p className="text-xs text-marvvn-gray-400 uppercase tracking-wider mb-3">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term: string) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 text-sm border border-marvvn-gray-300 hover:border-marvvn-black transition-colors cursor-pointer"
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
