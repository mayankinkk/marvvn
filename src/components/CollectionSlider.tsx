'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Product } from '@/lib/types'
import ProductCard from './ProductCard'

interface CollectionSliderProps {
  products: Product[]
  title: string
}

export default function CollectionSlider({ products, title }: CollectionSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 300
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="relative group">
      <div
        ref={scrollRef}
        className="flex gap-3 lg:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-[45%] md:w-[30%] lg:w-[22%] snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Arrows — sharp square, Bonkers Corner style */}
      <button
        type="button"
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white border border-black/15 shadow-sm items-center justify-center transition-all opacity-0 group-hover:opacity-100 hidden md:flex hover:bg-black hover:text-white hover:border-black"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white border border-black/15 shadow-sm items-center justify-center transition-all opacity-0 group-hover:opacity-100 hidden md:flex hover:bg-black hover:text-white hover:border-black"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}