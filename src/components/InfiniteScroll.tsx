'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Loader2 } from 'lucide-react'

interface InfiniteScrollProps {
  items: any[]
  renderItem: (item: any, index: number) => React.ReactNode
  itemsPerPage?: number
  className?: string
  loadMoreText?: string
  loadingText?: string
}

export default function InfiniteScroll({
  items,
  renderItem,
  itemsPerPage = 12,
  className = '',
  loadMoreText = 'Load More',
  loadingText = 'Loading...',
}: InfiniteScrollProps) {
  const [visibleCount, setVisibleCount] = useState(itemsPerPage)
  const [isLoading, setIsLoading] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)

  const visibleItems = items.slice(0, visibleCount)
  const hasMore = visibleCount < items.length

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return
    setIsLoading(true)
    // Simulate network delay for smooth UX
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + itemsPerPage, items.length))
      setIsLoading(false)
    }, 300)
  }, [isLoading, hasMore, itemsPerPage, items.length])

  // Intersection Observer for auto-loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isLoading, loadMore])

  // Reset when items change
  useEffect(() => {
    setVisibleCount(itemsPerPage)
  }, [items, itemsPerPage])

  return (
    <div className={className}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
        {visibleItems.map((item, index) => (
          <div key={item.id || index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Load more trigger */}
      {hasMore && (
        <div ref={observerRef} className="flex justify-center mt-8">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-marvvn-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              {loadingText}
            </div>
          ) : (
            <button
              onClick={loadMore}
              className="px-8 py-3 text-sm font-medium border border-marvvn-black hover:bg-marvvn-black hover:text-white transition-colors cursor-pointer"
            >
              {loadMoreText} ({items.length - visibleCount} remaining)
            </button>
          )}
        </div>
      )}

      {/* All items loaded */}
      {!hasMore && items.length > itemsPerPage && (
        <p className="text-center text-sm text-marvvn-gray-400 mt-8">
          All {items.length} items loaded
        </p>
      )}

      {/* No items */}
      {items.length === 0 && (
        <div className="text-center py-16">
          <p className="text-marvvn-gray-500">No items found</p>
        </div>
      )}
    </div>
  )
}
