'use client'

import { useState, useEffect } from 'react'
import ProductGrid from './ProductGrid'
import { Product } from '@/lib/types'

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
    <section className="py-8 lg:py-16">
      <div className="container">
        <h2 className="section-title mb-8">Recently Viewed</h2>
        <ProductGrid products={products} columns={4} />
      </div>
    </section>
  )
}
