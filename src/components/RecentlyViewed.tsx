'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { Clock } from 'lucide-react'

const STORAGE_KEY = 'marvvn-recently-viewed'
const MAX_ITEMS = 8

export function trackRecentlyViewed(product: Product) {
  if (typeof window === 'undefined') return
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const filtered = stored.filter((p: Product) => p.id !== product.id)
    filtered.unshift(product)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)))
  } catch {}
}

export default function RecentlyViewed() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      setProducts(stored.slice(0, MAX_ITEMS))
    } catch {}
  }, [])

  if (products.length === 0) return null

  return (
    <section className="py-10 lg:py-16 bg-marvvn-gray-50">
      <div className="container">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-marvvn-gray-400" />
          <h2 className="text-xl lg:text-2xl font-display font-medium">Recently Viewed</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.handle}`} className="group">
              <div className="aspect-[3/4] bg-white overflow-hidden relative mb-2">
                <Image
                  src={product.images?.[0] || '/placeholder.png'}
                  alt={product.title}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-sm font-medium truncate group-hover:underline">{product.title}</p>
              <p className="text-sm text-marvvn-gray-500">{formatPrice(product.price)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
