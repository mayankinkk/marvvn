'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Heart, ShoppingBag, Minus, Plus, ChevronRight, Truck, RotateCcw, Shield } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { products } from '@/lib/data'
import { formatPrice, calculateDiscount, cn } from '@/lib/utils'
import { useCartStore } from '@/lib/store'
import { useWishlistStore } from '@/lib/wishlist-store'

export default function ProductPage() {
  const params = useParams()
  const handle = params.handle as string
  const product = products.find((p) => p.handle === handle)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const { addItem, toggleCart } = useCartStore()
  const { toggleItem, isInWishlist } = useWishlistStore()

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link href="/" className="btn-primary">Return Home</Link>
        </div>
      </div>
    )
  }

  const discount = product.compareAtPrice ? calculateDiscount(product.compareAtPrice, product.price) : 0
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4)
  const inWishlist = isInWishlist(product.id)

  const handleAddToCart = () => {
    const size = selectedSize || product.sizes[0]
    const color = selectedColor || product.colors[0]
    for (let i = 0; i < quantity; i++) {
      addItem(product, size, color)
    }
    toggleCart()
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-4 lg:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-marvvn-gray-500 mb-6">
          <Link href="/" className="hover:text-marvvn-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/collections/${product.category}`} className="hover:text-marvvn-black capitalize">
            {product.category}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-marvvn-black truncate">{product.title}</span>
        </nav>

        {/* Product */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-marvvn-gray-50 overflow-hidden">
              <img
                src={product.images[activeImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={cn(
                      'w-20 h-24 border-2 overflow-hidden',
                      activeImage === index ? 'border-marvvn-black' : 'border-transparent'
                    )}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-display font-medium">{product.title}</h1>
              <div className="flex items-center gap-3 mt-3">
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
                {discount > 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-marvvn-red text-white rounded">
                    Save {discount}%
                  </span>
                )}
              </div>
            </div>

            <p className="text-marvvn-gray-600">{product.description}</p>

            {/* Sizes */}
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      'min-w-[48px] px-3 py-2 text-sm border transition-colors',
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

            {/* Colors */}
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider mb-3">Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      'px-4 py-2 text-sm border transition-colors',
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

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center border border-marvvn-gray-300 hover:border-marvvn-black transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center border border-marvvn-gray-300 hover:border-marvvn-black transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 btn-primary py-4 flex items-center justify-center gap-2 text-base"
              >
                <ShoppingBag className="w-5 h-5" />
                Add To Cart
              </button>
              <button
                type="button"
                onClick={() => toggleItem(product)}
                className={cn(
                  'w-14 h-14 flex items-center justify-center border transition-all',
                  inWishlist
                    ? 'border-marvvn-red bg-red-50 text-marvvn-red'
                    : 'border-marvvn-gray-300 hover:border-marvvn-black hover:bg-marvvn-gray-50'
                )}
              >
                <Heart className={cn('w-5 h-5', inWishlist && 'fill-current')} />
              </button>
            </div>

            {/* Features */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="w-5 h-5 text-marvvn-gray-400" />
                <span>Free shipping on orders over ₹1,499</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw className="w-5 h-5 text-marvvn-gray-400" />
                <span>7-day easy returns</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-5 h-5 text-marvvn-gray-400" />
                <span>100% genuine products</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 lg:mt-24">
            <h2 className="text-xl lg:text-2xl font-display font-medium mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
