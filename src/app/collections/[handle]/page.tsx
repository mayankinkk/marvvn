'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductGrid from '@/components/ProductGrid'
import { products, collections } from '@/lib/data'
import { cn } from '@/lib/utils'

const CATEGORY_MAP: Record<string, string> = {
  'women': 'women',
  'men': 'men',
  'accessories': 'accessories',
  'womens-new-arrivals': 'women',
  'mens-new-arrivals': 'men',
  'spiderman-women': 'women',
  'red-bull-collection': 'all',
}

const TAG_MAP: Record<string, string[]> = {
  'oversized-t-shirts': ['oversized'],
  'oversized-t-shirt-men': ['oversized'],
  'joggers': ['joggers'],
  'bottoms': ['pants', 'joggers', 'sweatpants', 'jeans'],
  'womens-bottoms': ['pants', 'joggers', 'sweatpants'],
  'mens-bottoms': ['pants', 'joggers', 'jeans'],
  'jackets': ['jacket', 'denim'],
  'sweatshirts-hoodies': ['sweatshirt', 'hoodie'],
  'caps': ['cap'],
  'jeans': ['jeans'],
}

const COLLECTION_FILTERS: Record<string, (p: typeof products[0]) => boolean> = {
  'new-arrivals': (p) => p.collection.includes('new-arrivals'),
  'best-sellers': (p) => p.collection.includes('best-sellers'),
  'women': (p) => p.category === 'women',
  'men': (p) => p.category === 'men',
  'accessories': (p) => p.category === 'accessories',
  'womens-new-arrivals': (p) => p.category === 'women' && p.collection.includes('new-arrivals'),
  'mens-new-arrivals': (p) => p.category === 'men' && p.collection.includes('new-arrivals'),
  'oversized-t-shirts': (p) => p.tags.some(t => t.includes('oversized')),
  'oversized-t-shirt-men': (p) => p.category === 'men' && p.tags.some(t => t.includes('oversized')),
  'bottoms': (p) => ['pants', 'joggers', 'sweatpants', 'jeans'].some(t => p.tags.includes(t)),
  'womens-bottoms': (p) => p.category === 'women' && ['pants', 'joggers', 'sweatpants'].some(t => p.tags.includes(t)),
  'mens-bottoms': (p) => p.category === 'men' && ['pants', 'joggers', 'jeans'].some(t => p.tags.includes(t)),
  'jackets': (p) => p.tags.some(t => t.includes('jacket') || t.includes('denim')),
  'caps': (p) => p.tags.some(t => t.includes('cap')),
  'spiderman-women': (p) => p.category === 'women',
  'red-bull-collection': () => true,
  'special-prices': (p) => !!p.compareAtPrice,
  'signature-collection-app': (p) => p.collection.includes('new-arrivals'),
  'acosta-collection-app': (p) => p.collection.includes('best-sellers'),
  'anime-collection-app': (p) => p.tags.some(t => t.includes('anime') || t.includes('marvel')),
  'sweatshirts-hoodies': (p) => p.tags.some(t => t.includes('sweatshirt') || t.includes('hoodie')),
  'premium': (p) => p.price >= 1999,
  'jeans': (p) => p.tags.some(t => t.includes('jeans')),
  'joggers': (p) => p.tags.some(t => t.includes('joggers')),
}

export default function CollectionPage() {
  const params = useParams()
  const handle = handle as string
  const [sortBy, setSortBy] = useState('newest')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 12

  const collection = collections.find((c) => c.handle === handle)

  const filteredProducts = useMemo(() => {
    let result = products

    const filterFn = COLLECTION_FILTERS[handle]
    if (filterFn) {
      result = result.filter(filterFn)
    }

    if (selectedSizes.length > 0) {
      result = result.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)))
    }
    if (selectedColors.length > 0) {
      result = result.filter((p) => p.colors.some((c) => selectedColors.includes(c)))
    }
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])

    switch (sortBy) {
      case 'price-low':
        result = [...result].sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result = [...result].sort((a, b) => b.price - a.price)
        break
      case 'oldest':
        result = [...result].reverse()
        break
      default:
        break
    }

    return result
  }, [handle, sortBy, selectedSizes, selectedColors, priceRange])

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  )

  const allSizes = [...new Set(products.flatMap((p) => p.sizes))]
  const allColors = [...new Set(products.flatMap((p) => p.colors))]

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
    setCurrentPage(1)
  }

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    )
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-4 lg:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-bonkers-gray-500 mb-6">
          <Link href="/" className="hover:text-bonkers-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-bonkers-black capitalize">
            {collection?.title || handle.replace(/-/g, ' ')}
          </span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-medium capitalize">
              {collection?.title || handle.replace(/-/g, ' ')}
            </h1>
            {collection?.description && (
              <p className="text-sm text-bonkers-gray-500 mt-1">{collection.description}</p>
            )}
            <p className="text-sm text-bonkers-gray-400 mt-1">{filteredProducts.length} products</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-bonkers-gray-300 text-sm hover:border-bonkers-black transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-bonkers-gray-300 text-sm focus:outline-none focus:border-bonkers-black"
            >
              <option value="newest">Sort by: Newest</option>
              <option value="price-low">Sort by: Price Low to High</option>
              <option value="price-high">Sort by: Price High to Low</option>
              <option value="oldest">Sort by: Oldest</option>
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className={cn(
            'w-64 flex-shrink-0 space-y-6',
            showFilters ? 'block' : 'hidden lg:block'
          )}>
            {/* Sizes */}
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {allSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={cn(
                      'min-w-[40px] px-2 py-1.5 text-xs border transition-colors',
                      selectedSizes.includes(size)
                        ? 'border-bonkers-black bg-bonkers-black text-white'
                        : 'border-bonkers-gray-300 hover:border-bonkers-black'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider mb-3">Color</h3>
              <div className="flex flex-wrap gap-2">
                {allColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => toggleColor(color)}
                    className={cn(
                      'px-3 py-1.5 text-xs border transition-colors',
                      selectedColors.includes(color)
                        ? 'border-bonkers-black bg-bonkers-black text-white'
                        : 'border-bonkers-gray-300 hover:border-bonkers-black'
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider mb-3">Price</h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="5000"
                  value={priceRange[1]}
                  onChange={(e) => { setPriceRange([0, Number(e.target.value)]); setCurrentPage(1) }}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-xs text-bonkers-gray-500">
                  <span>₹0</span>
                  <span>₹{priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedSizes.length > 0 || selectedColors.length > 0 || priceRange[1] < 5000) && (
              <button
                onClick={() => {
                  setSelectedSizes([])
                  setSelectedColors([])
                  setPriceRange([0, 5000])
                  setCurrentPage(1)
                }}
                className="text-sm text-bonkers-gray-500 underline underline-offset-4 hover:text-bonkers-black transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </aside>

          {/* Products */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <>
                <ProductGrid products={paginatedProducts} columns={4} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-bonkers-gray-300 hover:border-bonkers-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          'w-10 h-10 text-sm border transition-colors',
                          currentPage === page
                            ? 'border-bonkers-black bg-bonkers-black text-white'
                            : 'border-bonkers-gray-300 hover:border-bonkers-black'
                        )}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border border-bonkers-gray-300 hover:border-bonkers-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-bonkers-gray-500 mb-4">No products found matching your filters.</p>
                <button
                  onClick={() => {
                    setSelectedSizes([])
                    setSelectedColors([])
                    setPriceRange([0, 5000])
                    setCurrentPage(1)
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
