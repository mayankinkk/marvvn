'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Heart, ShoppingBag, Minus, Plus, ChevronRight, Truck, RotateCcw, Shield, Bell } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import ProductReviews from '@/components/ProductReviews'
import SizeGuide from '@/components/SizeGuide'
import RecentlyViewed, { trackRecentlyViewed } from '@/components/RecentlyViewed'
import { trackViewItem } from '@/components/Analytics'
import { useProducts, useProduct } from '@/lib/hooks/useProducts'
import { formatPrice, calculateDiscount, cn } from '@/lib/utils'
import { useCartStore } from '@/lib/store'
import { useWishlistStore } from '@/lib/wishlist-store'
import { useAuthStore } from '@/lib/auth-store'
import { useSettings } from '@/components/SettingsProvider'
import { FlashSaleTimer, CrossSellProducts, SizeRecommendations } from '@/components/ProductExtras'

export default function ProductPage() {
  const params = useParams()
  const handle = params.handle as string
  const { product, loading } = useProduct(handle)
  const { products } = useProducts()
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const { addItem, toggleCart } = useCartStore()
  const { format, symbol } = useCurrency()
  const { toggleItem, isInWishlist } = useWishlistStore()
  const { user } = useAuthStore()
  const settings = useSettings()
  const [stockAlertSigned, setStockAlertSigned] = useState(false)
  const [stockAlertEmail, setStockAlertEmail] = useState('')

  useEffect(() => {
    setSelectedSize('')
    setSelectedColor('')
    setQuantity(1)
    setActiveImage(0)
  }, [handle])

  useEffect(() => {
    if (product) {
      trackRecentlyViewed(product)
      trackViewItem(product.id, product.title, product.price)
    }
  }, [product])

  const handleStockAlert = async () => {
    const email = stockAlertEmail || user?.email
    if (!email || !product) return
    await fetch('/api/stock-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, email }),
    })
    setStockAlertSigned(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-marvvn-gray-100 rounded" />
            <div className="space-y-4">
              <div className="h-8 bg-marvvn-gray-100 rounded w-3/4" />
              <div className="h-6 bg-marvvn-gray-100 rounded w-1/4" />
              <div className="h-4 bg-marvvn-gray-100 rounded w-full" />
              <div className="h-4 bg-marvvn-gray-100 rounded w-full" />
              <div className="h-4 bg-marvvn-gray-100 rounded w-2/3" />
              <div className="h-12 bg-marvvn-gray-100 rounded w-full mt-8" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <Link href="/" className="btn-primary">Return Home</Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const discount = product.compareAtPrice ? calculateDiscount(product.compareAtPrice, product.price) : 0
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4)
  const inWishlist = isInWishlist(product.id)
  const isOutOfStock = product.stock !== undefined && product.stock <= 0

  const handleAddToCart = () => {
    const size = selectedSize || product.sizes[0]
    const color = selectedColor || product.colors[0]
    addItem(product, size, color, quantity)
    toggleCart()
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-4 lg:py-8">
        <nav className="flex items-center gap-2 text-xs text-marvvn-gray-500 mb-6">
          <Link href="/" className="hover:text-marvvn-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/collections/${product.category}`} className="hover:text-marvvn-black capitalize">
            {product.category}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-marvvn-black truncate">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-marvvn-gray-50 overflow-hidden relative">
              <Image
                src={product.images?.[activeImage] || '/placeholder.png'}
                alt={product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={cn(
                      'w-20 h-24 border-2 overflow-hidden relative cursor-pointer',
                      activeImage === index ? 'border-marvvn-black' : 'border-transparent'
                    )}
                  >
                    <Image src={image} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Flash Sale Timer */}
            {product.flash_sale && product.flash_sale_ends_at && product.flash_sale_price && (
              <FlashSaleTimer
                endsAt={product.flash_sale_ends_at}
                salePrice={product.flash_sale_price}
                originalPrice={product.price}
              />
            )}

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
                  product.compareAtPrice || product.flash_sale ? 'text-marvvn-red' : ''
                )}>
                  {formatPrice(product.flash_sale && product.flash_sale_price ? product.flash_sale_price : product.price)}
                </span>
                {discount > 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-marvvn-red text-white rounded">
                    Save {discount}%
                  </span>
                )}
              </div>
            </div>

            <p className="text-marvvn-gray-600">{product.description}</p>

            {/* Out of Stock Alert */}
            {isOutOfStock && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                {stockAlertSigned ? (
                  <p className="text-sm text-amber-700 flex items-center gap-2">
                    <Bell className="w-4 h-4" /> You&apos;ll be notified when this is back in stock!
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-amber-700 font-medium">This product is currently out of stock</p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="Your email"
                        value={stockAlertEmail}
                        onChange={(e) => setStockAlertEmail(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-amber-300 rounded focus:outline-none focus:border-amber-500"
                      />
                      <button onClick={handleStockAlert} className="px-3 py-2 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 cursor-pointer">
                        Notify Me
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium uppercase tracking-wider">Size</h3>
                <SizeGuide category={product.category === 'women' ? 'women' : 'men'} />
              </div>
              <SizeRecommendations category={product.category} currentSize={selectedSize} />
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

            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider mb-3">Color</h3>
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

            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center border border-marvvn-gray-300 hover:border-marvvn-black transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center border border-marvvn-gray-300 hover:border-marvvn-black transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 btn-primary py-4 flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                {isOutOfStock ? 'Out of Stock' : 'Add To Cart'}
              </button>
              <button
                type="button"
                onClick={() => toggleItem(product)}
                className={cn(
                  'w-14 h-14 flex items-center justify-center border transition-all cursor-pointer',
                  inWishlist
                    ? 'border-marvvn-red bg-red-50 text-marvvn-red'
                    : 'border-marvvn-gray-300 hover:border-marvvn-black hover:bg-marvvn-gray-50'
                )}
              >
                <Heart className={cn('w-5 h-5', inWishlist && 'fill-current')} />
              </button>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="w-5 h-5 text-marvvn-gray-400" />
                <span>Free shipping on orders over {symbol}{settings.free_shipping_threshold || '999'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw className="w-5 h-5 text-marvvn-gray-400" />
                <span>3-day easy returns</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-5 h-5 text-marvvn-gray-400" />
                <span>100% genuine products</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw className="w-5 h-5 text-marvvn-gray-400" />
                <span>Shipping fee deducted from refund on free-shipping orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cross-sell / Complete The Look */}
        <CrossSellProducts currentProductId={product.id} category={product.category} />

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

        <ProductReviews productHandle={handle} />
      </main>

      <RecentlyViewed />

      <Footer />
    </div>
  )
}

function useCurrency() {
  return { format: (n: number) => `₹${n.toLocaleString()}`, symbol: '₹' }
}
