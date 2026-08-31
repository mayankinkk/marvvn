'use client'

import { useState, useCallback } from 'react'
import { ShoppingBag, Heart } from 'lucide-react'
import { Product } from '@/lib/types'
import { formatPrice, cn } from '@/lib/utils'
import { useCartStore } from '@/lib/store'

interface StickyAddToCartProps {
  product: Product
  selectedSize: string
  selectedColor: string
  onAddToCart: () => void
}

export default function StickyAddToCart({ product, selectedSize, selectedColor, onAddToCart }: StickyAddToCartProps) {
  const isOutOfStock = product.stock !== undefined && product.stock <= 0

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-marvvn-gray-200 shadow-lg">
      <div className="container py-3">
        <div className="flex items-center gap-3">
          {/* Price */}
          <div className="flex-1 min-w-0">
            <p className="text-lg font-medium truncate">{formatPrice(product.price)}</p>
            <p className="text-xs text-marvvn-gray-500 truncate">
              {selectedSize && `Size: ${selectedSize}`}
              {selectedSize && selectedColor && ' | '}
              {selectedColor && `Color: ${selectedColor}`}
            </p>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className="flex-shrink-0 px-6 py-3 bg-marvvn-black text-white text-sm font-medium flex items-center gap-2 hover:bg-marvvn-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-4 h-4" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}
