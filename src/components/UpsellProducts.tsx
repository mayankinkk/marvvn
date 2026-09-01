'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { Plus, ShoppingCart } from 'lucide-react'

interface UpsellProduct {
  id: string
  title: string
  price: number
  handle: string
  images: string[]
}

export default function UpsellProducts() {
  const { items, addItem } = useCartStore()
  const [products, setProducts] = useState<UpsellProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [addedId, setAddedId] = useState<string | null>(null)

  useEffect(() => {
    // Fetch random products not in cart
    const cartIds = items.map(i => i.product.id)
    fetch(`/api/products?limit=10&random=true`)
      .then(res => res.json())
      .then(data => {
        const filtered = (data.products || []).filter((p: UpsellProduct) => !cartIds.includes(p.id)).slice(0, 2)
        setProducts(filtered)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [items])

  const handleAdd = (product: UpsellProduct) => {
    addItem({
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        handle: product.handle,
        images: product.images,
        compare_at_price: null,
      },
      quantity: 1,
      size: 'M',
      color: null,
    })
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 2000)
  }

  if (loading || products.length === 0) return null

  return (
    <div className="border border-marvvn-gray-200 p-4 mt-4">
      <p className="text-xs font-semibold text-marvvn-gray-500 uppercase tracking-wide mb-3">Add to your order</p>
      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="flex gap-3 items-center">
            <Link href={`/products/${product.handle}`} className="w-14 h-14 bg-marvvn-gray-50 relative flex-shrink-0 overflow-hidden">
              <Image
                src={product.images?.[0] || '/placeholder.png'}
                alt={product.title}
                fill
                sizes="56px"
                className="object-cover"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/products/${product.handle}`} className="text-xs font-medium truncate block hover:underline">
                {product.title}
              </Link>
              <p className="text-xs text-marvvn-gray-500">{formatPrice(product.price)}</p>
            </div>
            <button
              onClick={() => handleAdd(product)}
              disabled={addedId === product.id}
              className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium border transition-colors cursor-pointer ${
                addedId === product.id
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'border-marvvn-gray-300 hover:border-marvvn-black hover:bg-marvvn-black hover:text-white'
              }`}
            >
              {addedId === product.id ? (
                <>Added</>
              ) : (
                <>
                  <Plus className="w-3 h-3" />
                  Add
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
