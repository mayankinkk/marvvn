'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Product } from '@/lib/types'

interface FlashSaleTimerProps {
  endsAt: string
  salePrice: number
  originalPrice: number
}

function FlashSaleTimer({ endsAt, salePrice, originalPrice }: FlashSaleTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const end = new Date(endsAt).getTime()
      const diff = end - now

      if (diff <= 0) {
        setExpired(true)
        clearInterval(timer)
        return
      }

      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [endsAt])

  if (expired) return null

  const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100)

  return (
    <div className="bg-red-600 text-white p-3 rounded-lg mb-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold">FLASH SALE -{discount}%</span>
        <div className="flex items-center gap-1 text-sm font-mono">
          <span className="bg-white/20 px-1.5 py-0.5 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span>:</span>
          <span className="bg-white/20 px-1.5 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span>:</span>
          <span className="bg-white/20 px-1.5 py-0.5 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-lg font-bold">{formatPrice(salePrice)}</span>
        <span className="text-sm line-through opacity-75">{formatPrice(originalPrice)}</span>
      </div>
    </div>
  )
}

interface CrossSellProps {
  currentProductId: string
  category: string
}

export function CrossSellProducts({ currentProductId, category }: CrossSellProps) {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch(`/api/products?category=${category}`)
      .then(res => res.json())
      .then(data => {
        const related = (data.products || [])
          .filter((p: Product) => p.id !== currentProductId)
          .slice(0, 4)
        setProducts(related)
      })
      .catch(() => {})
  }, [currentProductId, category])

  if (products.length === 0) return null

  return (
    <section className="mt-16 lg:mt-24">
      <h2 className="text-xl lg:text-2xl font-display font-medium mb-6">Complete The Look</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-6">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.handle}`} className="group">
            <div className="aspect-[3/4] bg-marvvn-gray-50 overflow-hidden relative mb-2">
              <Image
                src={product.images?.[0] || '/placeholder.png'}
                alt={product.title}
                fill
                loading="lazy"
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <p className="text-sm font-medium truncate">{product.title}</p>
            <p className="text-sm text-marvvn-gray-500">{formatPrice(product.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

interface SizeRecommendationsProps {
  category: string
  currentSize: string
}

export function SizeRecommendations({ category, currentSize }: SizeRecommendationsProps) {
  const [topSizes, setTopSizes] = useState<{ size: string; count: number }[]>([])

  useEffect(() => {
    fetch(`/api/analytics/top-sizes?category=${category}`)
      .then(res => res.json())
      .then(data => setTopSizes(data.sizes || []))
      .catch(() => {})
  }, [category])

  if (topSizes.length === 0) return null

  return (
    <div className="mt-2 mb-4">
      <p className="text-xs text-marvvn-gray-500">
        Most ordered size: <span className="font-medium text-marvvn-black">{topSizes[0]?.size}</span>
        {topSizes.length > 1 && (
          <span className="text-marvvn-gray-400"> · Also popular: {topSizes.slice(1, 3).map(s => s.size).join(', ')}</span>
        )}
      </p>
    </div>
  )
}

export { FlashSaleTimer }
