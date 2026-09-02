'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ImageZoom from '@/components/ImageZoom'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { useParams } from 'next/navigation'
import { Heart, ShoppingBag, Minus, Plus, ChevronRight, Truck, RotateCcw, Shield, Bell, MapPin, Package, CreditCard, Zap, Star } from 'lucide-react'
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
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd'
import StickyAddToCart from '@/components/StickyAddToCart'

type Tab = 'size-fit' | 'fabric-care' | 'reviews' | 'shipping' | 'returns'

const featureIconMap: Record<string, any> = {
  'package': Package,
  'credit-card': CreditCard,
  'zap': Zap,
  'rotate-ccw': RotateCcw,
  'truck': Truck,
  'shield': Shield,
  'heart': Heart,
  'star': Star,
}

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

  // Delivery check
  const [pincode, setPincode] = useState('')
  const [deliveryInfo, setDeliveryInfo] = useState<{ estimate: string; startDate: string; endDate: string } | null>(null)
  const [deliveryLoading, setDeliveryLoading] = useState(false)
  const [deliveryError, setDeliveryError] = useState('')

  // Tabs
  const [activeTab, setActiveTab] = useState<Tab>('size-fit')

  // Parse settings-driven content — per-product overrides global
  const whatYouGetFeatures: { icon: string; title: string; subtitle: string }[] = (() => {
    if (product?.what_you_get && Array.isArray(product.what_you_get) && product.what_you_get.length > 0) {
      return product.what_you_get
    }
    try { return JSON.parse(settings.product_what_you_get || '[]') } catch { return [] }
  })()

  const fabricCareLines = (settings.product_fabric_care || '').split('\n').filter(Boolean).map((l: string) => l.trim())
  const fabricNotesLines = (settings.product_fabric_notes || '').split('\n').filter(Boolean).map((l: string) => l.trim())
  const shippingLines = (settings.product_shipping_text || 'We currently offer 5% discount on all pre-paid orders.\nFree shipping on orders above {threshold}.\nStandard shipping fee of {shipping_fee} applies on orders below {threshold}.\nShips within 48 hours. Delivery in 4-7 business days across India.')
    .replace(/{threshold}/g, `₹${settings.free_shipping_threshold || '999'}`)
    .replace(/{shipping_fee}/g, `₹${settings.shipping_fee || '65'}`)
    .split('\n').filter(Boolean).map((l: string) => l.trim())
  const returnsLines = (settings.product_returns_text || 'Returns accepted within 3 days of delivery only.\nProduct must be unused, unworn, unwashed, with original tags and packaging.\nNo exchanges — refund only.\nDelivery charges are non-refundable.\nApplicable shipping charges will be deducted from refunds for returned free-shipping orders.\nDamaged or used items will not be accepted.\nIf you received a damaged item, contact us within 24 hours with photos/videos.')
    .split('\n').filter(Boolean).map((l: string) => l.trim())
  const otherInfoLines = (settings.product_other_info || '').split('\n').filter(Boolean).map((l: string) => l.trim())

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'size-fit', label: 'Size & Fit', icon: Package },
    { id: 'fabric-care', label: 'Fabric & Care', icon: Shield },
    { id: 'reviews', label: 'Reviews', icon: Heart },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'returns', label: 'Returns & Exchange', icon: RotateCcw },
  ]

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

  const checkDelivery = async () => {
    if (pincode.length !== 6) return
    setDeliveryLoading(true)
    setDeliveryError('')
    try {
      const res = await fetch(`/api/delivery-check?pincode=${pincode}`)
      const data = await res.json()
      if (data.error) {
        setDeliveryError(data.error)
      } else {
        setDeliveryInfo(data)
      }
    } catch {
      setDeliveryError('Could not check delivery')
    }
    setDeliveryLoading(false)
  }

  const handleBuyNow = () => {
    if (!product) return
    const size = selectedSize || product.sizes[0]
    const color = selectedColor || product.colors[0]
    addItem(product, size, color, quantity)
    window.location.href = '/checkout'
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
  const displayPrice = product.flash_sale && product.flash_sale_price ? product.flash_sale_price : product.price

  // Compute variant stock
  const activeSize = selectedSize || product.sizes[0]
  const activeColor = selectedColor || product.colors[0]
  const hasVariants = product.variants && product.variants.length > 0
  const selectedVariant = hasVariants
    ? product.variants!.find(v => v.size === activeSize && v.color === activeColor)
    : null
  const variantStock = selectedVariant?.stock
  // Use variant stock if available, fall back to product-level stock
  const effectiveStock = hasVariants ? (variantStock ?? 0) : product.stock
  const isOutOfStock = effectiveStock !== undefined && effectiveStock <= 0
  const lowStock = !isOutOfStock && typeof effectiveStock === 'number' && effectiveStock > 0 && effectiveStock <= 5

  // Check if a specific size is available (has stock) for the active color
  const isSizeAvailable = (size: string) => {
    if (!hasVariants) return true
    const variant = product.variants!.find(v => v.size === size && v.color === activeColor)
    return variant ? variant.stock > 0 : false
  }

  const handleAddToCart = () => {
    const size = selectedSize || product.sizes[0]
    const color = selectedColor || product.colors[0]
    addItem(product, size, color, quantity)
    toggleCart()
  }

  return (
    <div className="min-h-screen">
      <ProductJsonLd
        product={{
          title: product.title,
          handle: product.handle,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          images: product.images,
          category: product.category,
          sizes: product.sizes,
          stock: product.stock,
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: product.category, url: `/collections/${product.category}` },
          { name: product.title, url: `/products/${product.handle}` },
        ]}
      />
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
          {/* Left — Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-marvvn-gray-50 overflow-hidden relative">
              <ImageZoom
                src={product.images?.[activeImage] || '/placeholder.png'}
                alt={product.title}
                className="w-full h-full"
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

          {/* Right — Product Info */}
          <div className="space-y-5">
            {/* Flash Sale Timer */}
            {product.flash_sale && product.flash_sale_ends_at && product.flash_sale_price && (
              <FlashSaleTimer
                endsAt={product.flash_sale_ends_at}
                salePrice={product.flash_sale_price}
                originalPrice={product.price}
              />
            )}

            {/* Title + Wishlist */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl lg:text-3xl font-display font-medium leading-tight">{product.title}</h1>
              <button
                type="button"
                onClick={() => toggleItem(product)}
                className={cn(
                  'flex-shrink-0 w-10 h-10 flex items-center justify-center border transition-all cursor-pointer mt-1',
                  inWishlist
                    ? 'border-marvvn-red bg-red-50 text-marvvn-red'
                    : 'border-marvvn-gray-300 hover:border-marvvn-black hover:bg-marvvn-gray-50'
                )}
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
                product.compareAtPrice || product.flash_sale ? 'text-marvvn-red' : ''
              )}>
                {formatPrice(displayPrice)}
              </span>
              {discount > 0 && (
                <span className="px-2 py-1 text-xs font-medium bg-marvvn-red text-white rounded">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Shipping text */}
            <p className="text-sm text-marvvn-gray-500">
              {settings.product_shipping_calc_text || 'Shipping calculated at checkout.'}
            </p>

            <p className="text-marvvn-gray-600 text-sm">{product.description}</p>

            {/* Check Delivery & Pickup */}
            <div className="border rounded-xl p-4">
              <p className="text-sm font-medium mb-3">Check Delivery and Pickup:</p>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-marvvn-gray-400" />
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setDeliveryInfo(null); setDeliveryError('') }}
                    placeholder="Enter pincode"
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-marvvn-gray-300 focus:border-marvvn-black focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && checkDelivery()}
                  />
                </div>
                <button
                  onClick={checkDelivery}
                  disabled={pincode.length !== 6 || deliveryLoading}
                  className="px-6 py-2.5 text-sm font-medium border border-marvvn-black hover:bg-marvvn-black hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {deliveryLoading ? 'Checking...' : deliveryInfo ? 'Change' : 'Check'}
                </button>
              </div>
              {deliveryInfo && (
                <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded">
                  <Truck className="w-4 h-4 flex-shrink-0" />
                  <span>{deliveryInfo.estimate}</span>
                </div>
              )}
              {deliveryError && (
                <p className="mt-2 text-sm text-red-600">{deliveryError}</p>
              )}
            </div>

            {/* Stock display */}
            {hasVariants && !isOutOfStock && typeof effectiveStock === 'number' && effectiveStock > 5 && (
              <div className="text-sm text-marvvn-gray-500">
                {effectiveStock} in stock
              </div>
            )}

            {/* Low Stock Urgency */}
            {lowStock && (
              <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Only {effectiveStock} left in stock — order soon!
              </div>
            )}

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

            {/* Size */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 text-sm">
                  <h3 className="font-medium uppercase tracking-wider">Size</h3>
                  {product.waist && (
                    <span className="text-marvvn-gray-500">| WAIST {product.waist.toUpperCase()}</span>
                  )}
                  {product.length && (
                    <span className="text-marvvn-gray-500">| LENGTH {product.length.toUpperCase()}</span>
                  )}
                </div>
                <SizeGuide category={product.category === 'women' ? 'women' : 'men'} />
              </div>
              <SizeRecommendations category={product.category} currentSize={selectedSize} />
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const available = isSizeAvailable(size)
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => available && setSelectedSize(size)}
                      disabled={!available}
                      className={cn(
                        'min-w-[48px] px-3 py-2 text-sm border transition-colors cursor-pointer relative',
                        selectedSize === size
                          ? 'border-marvvn-black bg-marvvn-black text-white'
                          : available
                            ? 'border-marvvn-gray-300 hover:border-marvvn-black'
                            : 'border-marvvn-gray-200 text-marvvn-gray-300 cursor-not-allowed',
                        !available && 'line-through decoration-marvvn-gray-400'
                      )}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Color */}
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

            {/* Quantity + Add to Cart row */}
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
                disabled={isOutOfStock}
                className="flex-1 h-12 btn-primary flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                {isOutOfStock ? 'Out of Stock' : 'Add To Cart'}
              </button>
            </div>

            {/* Buy It Now */}
            {settings.product_buy_now_enabled !== 'false' && (
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full h-12 bg-marvvn-black text-white font-medium text-sm hover:bg-marvvn-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy It Now
              </button>
            )}

            {/* Special Offers */}
            {settings.product_special_offers_enabled !== 'false' && (
              <div className="border rounded-xl p-4">
                <h3 className="text-sm font-medium mb-3">{settings.product_special_offers_title || 'Special Offers'}</h3>
                <div className="bg-marvvn-black text-white rounded-lg p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{settings.product_special_offers_text || 'Get ₹65 Off on UPI'}</p>
                    <p className="text-xs text-marvvn-gray-300">{settings.product_special_offers_subtitle || '5+ Discounts Available'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* What You Get */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-display font-medium mb-2">What You Get for {formatPrice(displayPrice)}</h3>
              <p className="text-sm text-marvvn-gray-500 mb-4">
                {product.title} designed for everyday comfort, durability, and hassle-free delivery.
              </p>
              <div className="space-y-4">
                {whatYouGetFeatures.map((feat, i) => {
                  const Icon = featureIconMap[feat.icon] || Package
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-marvvn-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-marvvn-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{feat.title}</p>
                        <p className="text-xs text-marvvn-gray-500">{feat.subtitle}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12 lg:mt-16 border-t pt-8">
          <div className="flex gap-2 flex-wrap mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer',
                  activeTab === tab.id
                    ? 'bg-marvvn-black text-white'
                    : 'bg-marvvn-gray-100 text-marvvn-gray-600 hover:bg-marvvn-gray-200'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-w-3xl">
            {activeTab === 'size-fit' && (
              <div className="space-y-6">
                {/* Per-product Size & Fit text */}
                {product.size_fit_text ? (
                  <div className="space-y-2">
                    {product.size_fit_text.split('\n').filter(Boolean).map((line: string, i: number) => (
                      <p key={i} className="text-sm text-marvvn-gray-600">{line.trim()}</p>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-marvvn-gray-600">
                      {product.model_info
                        || (product.category === 'women'
                          ? (settings.product_size_fit_women || "The model (Height 5'7\") is wearing size S")
                          : (settings.product_size_fit_men || "The model (Height 5'10\") is wearing size M"))}
                    </p>
                    {product.waist && (
                      <p className="text-sm text-marvvn-gray-600">Waist - {product.waist}</p>
                    )}
                    {product.length && (
                      <p className="text-sm text-marvvn-gray-600">Length - {product.length}</p>
                    )}
                    <p className="text-sm text-marvvn-gray-600">
                      {settings.product_size_fit_advice || 'Fits true to size. Do you need size advice? Please refer to our size chart.'}
                    </p>
                  </div>
                )}

                {/* Fabric Composition + GSM */}
                {(product.fabric_composition || product.gsm) && (
                  <div className="border-t pt-4 space-y-2">
                    {product.fabric_composition && (
                      <p className="text-sm text-marvvn-gray-600">Composition - {product.fabric_composition}</p>
                    )}
                    {product.gsm && (
                      <p className="text-sm text-marvvn-gray-600">GSM - {product.gsm}</p>
                    )}
                  </div>
                )}

                <SizeGuide category={product.category === 'women' ? 'women' : 'men'} />

                {otherInfoLines.length > 0 && (
                  <div className="border-t pt-6 mt-6">
                    <h4 className="text-sm font-medium mb-3">Other Information</h4>
                    <ul className="text-sm text-marvvn-gray-600 space-y-2 list-disc list-inside">
                      {otherInfoLines.map((line: string, i: number) => <li key={i}>{line}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'fabric-care' && (
              <div className="space-y-4">
                <div className="text-sm text-marvvn-gray-600 space-y-2">
                  {fabricCareLines.map((line: string, i: number) => <p key={i}>{line}</p>)}
                </div>
                {fabricNotesLines.length > 0 && (
                  <div className="mt-6 space-y-3 text-sm text-marvvn-gray-500 border-t pt-4">
                    {fabricNotesLines.map((line: string, i: number) => <p key={i}>{line}</p>)}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <ProductReviews productHandle={handle} />
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4">
                <div className="text-sm text-marvvn-gray-600 space-y-3">
                  {shippingLines.map((line: string, i: number) => <p key={i}>{line}</p>)}
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Assistance</h4>
                  <p className="text-sm text-marvvn-gray-600">
                    Contact us at <a href={`mailto:${settings.store_email || 'marvvnclothing@gmail.com'}`} className="underline">{settings.store_email || 'marvvnclothing@gmail.com'}</a>
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'returns' && (
              <div className="space-y-4">
                <div className="text-sm text-marvvn-gray-600 space-y-3">
                  {returnsLines.map((line: string, i: number) => <p key={i}>{line}</p>)}
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Refund Process</h4>
                  <p className="text-sm text-marvvn-gray-600">
                    {settings.product_returns_refund || 'After we receive and inspect the returned item, your refund will be credited to your original payment method within 5-7 business days.'}
                  </p>
                </div>
              </div>
            )}
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
      </main>

      <RecentlyViewed />

      {/* Sticky Add to Cart - Mobile only */}
      <StickyAddToCart
        product={product}
        selectedSize={selectedSize || product.sizes[0]}
        selectedColor={selectedColor || product.colors[0]}
        onAddToCart={handleAddToCart}
      />

      <Footer />
    </div>
  )
}
