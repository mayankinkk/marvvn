'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Product } from '@/lib/types'
import Image from 'next/image'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id))
      } else {
        alert('Failed to delete product')
      }
    } catch {
      alert('Failed to delete product')
    }
    setDeleting(null)
  }

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.handle.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-marvvn-black border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-medium">Products ({products.length})</h1>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-marvvn-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="bg-white border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-marvvn-gray-500">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Badge</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-marvvn-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 bg-marvvn-gray-100 flex-shrink-0 overflow-hidden">
                        <Image src={product.images?.[0] || '/placeholder.png'} alt="" width={48} height={56} className="w-full h-full object-cover" unoptimized />
                      </div>
                      <div>
                        <p className="font-medium truncate max-w-[200px]">{product.title}</p>
                        <p className="text-xs text-marvvn-gray-400">{product.handle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{product.category}</td>
                  <td className="px-4 py-3">
                    {formatPrice(product.price)}
                    {product.compareAtPrice && (
                      <span className="text-marvvn-gray-400 line-through ml-1 text-xs">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {product.badge && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        product.badge === 'new' ? 'bg-marvvn-black text-white' :
                        product.badge === 'sale' ? 'bg-marvvn-red text-white' :
                        'bg-marvvn-gold text-white'
                      }`}>
                        {product.badge}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-2 hover:bg-marvvn-gray-100 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        disabled={deleting === product.id}
                        className="p-2 hover:bg-red-50 text-marvvn-gray-400 hover:text-marvvn-red rounded transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-marvvn-gray-400">
            No products found
          </div>
        )}
      </div>
    </div>
  )
}
