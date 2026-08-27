'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag } from 'lucide-react'
import { Product } from '@/lib/types'
import { formatPrice, calculateDiscount, cn } from '@/lib/utils'
import { useCartStore } from '@/lib/store'
import { useWishlistStore } from '@/lib/wishlist-store'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '')
  const { addItem, toggleCart } = useCartStore()
  const { toggleItem, isInWishlist } = useWishlistStore()
  const discount = product.compareAtPrice ? calculateDiscount(product.compareAtPrice, product.price) : 0
  const inWishlist = isInWishlist(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, selectedSize, product.colors?.[0] || '')
    toggleCart()
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleItem(product)
  }

  return (
    <Link
      href={`/products/${product.handle}`}
      className="product-card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden bg-marvvn-gray-50 aspect-[3/4]">
        <Image
          src={product.images?.[0] || '/placeholder.png'}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            'object-cover transition-transform duration-500',
            isHovered && 'scale-105'
          )}
        />
        {product.badge === 'sale' && discount > 0 && (
          <span className="product-badge">Save {discount}%</span>
        )}
        {product.badge === 'new' && (
          <span className="product-badge bg-marvvn-black">New</span>
        )}
        {product.badge === 'bestseller' && (
          <span className="product-badge bg-marvvn-gold">Bestseller</span>
        )}

        <div className={cn(
          'absolute bottom-0 left-0 right-0 p-3 transition-all duration-300',
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        )}>
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            Add To Cart
          </button>
        </div>

        <button
          type="button"
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:bg-marvvn-gray-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('w-4 h-4', inWishlist && 'fill-marvvn-red text-marvvn-red')} />
        </button>
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium truncate">{product.title}</h3>
        <div className="flex items-center gap-2">
          {product.compareAtPrice && (
            <span className="text-sm text-marvvn-gray-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
          <span className={cn(
            'text-sm font-medium',
            product.compareAtPrice ? 'text-marvvn-red' : ''
          )}>
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </Link>
  )
}
