'use client'

import { useState, useCallback } from 'react'
import { X, Heart, ShoppingBag, Minus, Plus, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/lib/types'
import { formatPrice, calculateDiscount, cn } from '@/lib/utils'
import { useCartStore } from '@/lib/store'
import { useWishlistStore } from '@/lib/wishlist-store'

interface QuickViewModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '')
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '')
  const [quantity, setQuantity] = useState(1)
  const { addItem, toggleCart } = useCartStore()
  const { toggleItem, isInWishlist } = useWishlistStore()
  const discount = product.compareAtPrice ? calculateDiscount(product.compareAtPrice, product.price) : 0
  const inWishlist = isInWishlist(product.id)

  const handleAddToCart = useCallback(() => {
    addItem(product, selectedSize, selectedColor, quantity)
    toggleCart()
    onClose()
  }, [product, selectedSize, selectedColor, quantity, addItem, toggleCart, onClose])

  const handleBuyNow = useCallback(() => {
    addItem(product, selectedSize, selectedColor, quantity)
    window.location.href = '/checkout'
  }, [product, selectedSize, selectedColor, quantity, addItem])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full hover:bg-white transition-colors cursor-pointer"
          aria-label="Close quick view"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative aspect-[3/4] md:aspect-auto bg-marvvn-gray-50">
            <Image
              src={product.images?.[0] || '/placeholder.png'}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 text-xs font-bold bg-marvvn-red text-white">
                Save {discount}%
              </span>
            )}
          </div>

          {/* Details */}
          <div className="p-6 space-y-5">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-marvvn-gray-500">
              <Link href="/" className="hover:text-marvvn-black" onClick={onClose}>Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href={`/collections/${product.category}`} className="hover:text-marvvn-black capitalize" onClick={onClose}>
                {product.category}
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-marvvn-black truncate">{product.title}</span>
            </nav>

            {/* Title + Wishlist */}
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl lg:text-2xl font-display font-medium">{product.title}</h2>
              <button
                type="button"
                onClick={() => toggleItem(product)}
                className={cn(
                  'flex-shrink-0 w-10 h-10 flex items-center justify-center border transition-all cursor-pointer',
                  inWishlist
                    ? 'border-marvvn-red bg-red-50 text-marvvn-red'
                    : 'border-marvvn-gray-300 hover:border-marvvn-black'
                )}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={cn('w-5 h-5', inWishlist && 'fill-current')} />
              </button>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              {product.compareAtPrice && (
                <span className="text-lg text-marvvn-gray-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
              <span className={cn(
                'text-2xl font-medium',
                product.compareAtPrice ? 'text-marvvn-red' : ''
              )}>
                {formatPrice(product.price)}
              </span>
            </div>

            <p className="text-sm text-marvvn-gray-600 line-clamp-3">{product.description}</p>

            {/* Size */}
            {product.sizes?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider mb-2">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        'min-w-[48px] px-3 py-2 text-sm border transition-colors cursor-pointer',
                        selectedSize === size
                          ? 'border-marvvn-black bg-marvvn-black text-white'
                          : 'border-marvvn-gray-300 hover:border-marvvn-black'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color */}
            {product.colors?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider mb-2">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'px-4 py-2 text-sm border transition-colors cursor-pointer',
                        selectedColor === color
                          ? 'border-marvvn-black bg-marvvn-black text-white'
                          : 'border-marvvn-gray-300 hover:border-marvvn-black'
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-marvvn-gray-300">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-12 flex items-center justify-center hover:bg-marvvn-gray-50 transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-12 flex items-center justify-center hover:bg-marvvn-gray-50 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 h-12 btn-primary flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Add To Cart
              </button>
            </div>

            {/* Buy It Now */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full h-12 bg-marvvn-black text-white font-medium text-sm hover:bg-marvvn-gray-800 transition-colors cursor-pointer"
            >
              Buy It Now
            </button>

            {/* View Full Details */}
            <Link
              href={`/products/${product.handle}`}
              className="block text-center text-sm font-medium underline underline-offset-4 hover:text-marvvn-gray-600 transition-colors"
              onClick={onClose}
            >
              View Full Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
