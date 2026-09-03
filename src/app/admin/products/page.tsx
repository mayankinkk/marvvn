'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Search, CheckSquare, Square, X, DollarSign, Tag, Star, Package, Upload } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Product } from '@/lib/types'
import Image from 'next/image'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<string | null>(null)
  const [bulkValue, setBulkValue] = useState('')
  const [bulkSaving, setBulkSaving] = useState(false)

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
        setSelected(prev => { const n = new Set(prev); n.delete(id); return n })
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
    p.handle.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.available_sizes?.some(s => s.size.toLowerCase().includes(search.toLowerCase())) ||
    p.sizes?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  )

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(p => p.id)))
    }
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const executeBulkAction = async () => {
    if (!bulkAction || selected.size === 0) return

    if (bulkAction === 'delete') {
      if (!confirm(`Delete ${selected.size} products?`)) return
    }

    setBulkSaving(true)
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selected),
          action: bulkAction,
          value: bulkAction === 'price' ? parseFloat(bulkValue) :
                 bulkAction === 'compare_at_price' ? (bulkValue ? parseFloat(bulkValue) : null) :
                 bulkAction === 'is_new' || bulkAction === 'is_bestseller' ? bulkValue === 'true' :
                 bulkValue,
        }),
      })

      if (res.ok) {
        if (bulkAction === 'delete') {
          setProducts(products.filter(p => !selected.has(p.id)))
        } else {
          setProducts(products.map(p => {
            if (!selected.has(p.id)) return p
            const updated = { ...p }
            if (bulkAction === 'price') updated.price = parseFloat(bulkValue)
            if (bulkAction === 'compare_at_price') updated.compareAtPrice = bulkValue ? parseFloat(bulkValue) : undefined
            if (bulkAction === 'badge') updated.badge = (bulkValue as 'new' | 'sale' | 'bestseller') || null
            if (bulkAction === 'is_new') updated.isNew = bulkValue === 'true'
            if (bulkAction === 'is_bestseller') updated.isBestseller = bulkValue === 'true'
            if (bulkAction === 'category') updated.category = bulkValue as 'men' | 'women' | 'accessories'
            return updated
          }))
        }
        setSelected(new Set())
        setBulkAction(null)
        setBulkValue('')
      }
    } catch {}
    setBulkSaving(false)
  }

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
        <div className="flex items-center gap-3">
          <Link href="/admin/products/import" className="btn-secondary flex items-center gap-2 text-sm">
            <Upload className="w-4 h-4" />
            Import CSV
          </Link>
          <Link href="/admin/products/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
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

      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <div className="bg-marvvn-black text-white rounded-xl p-4 mb-4 flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={bulkAction || ''}
              onChange={(e) => { setBulkAction(e.target.value || null); setBulkValue('') }}
              className="bg-white/10 border border-white/20 text-white text-sm px-3 py-1.5 rounded-lg focus:outline-none"
            >
              <option value="">Choose action...</option>
              <option value="price">Update Price</option>
              <option value="compare_at_price">Set Compare Price</option>
              <option value="badge">Set Badge</option>
              <option value="is_new">Mark as New</option>
              <option value="is_bestseller">Mark as Bestseller</option>
              <option value="category">Change Category</option>
              <option value="delete">Delete Selected</option>
            </select>

            {bulkAction === 'price' && (
              <input
                type="number"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder="New price"
                className="bg-white/10 border border-white/20 text-white text-sm px-3 py-1.5 rounded-lg focus:outline-none w-32"
              />
            )}
            {bulkAction === 'compare_at_price' && (
              <input
                type="number"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder="Compare price (0 to clear)"
                className="bg-white/10 border border-white/20 text-white text-sm px-3 py-1.5 rounded-lg focus:outline-none w-44"
              />
            )}
            {bulkAction === 'badge' && (
              <select
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                className="bg-white/10 border border-white/20 text-white text-sm px-3 py-1.5 rounded-lg focus:outline-none"
              >
                <option value="">No Badge</option>
                <option value="new">New</option>
                <option value="sale">Sale</option>
                <option value="bestseller">Bestseller</option>
              </select>
            )}
            {bulkAction === 'is_new' && (
              <select
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                className="bg-white/10 border border-white/20 text-white text-sm px-3 py-1.5 rounded-lg focus:outline-none"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            )}
            {bulkAction === 'is_bestseller' && (
              <select
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                className="bg-white/10 border border-white/20 text-white text-sm px-3 py-1.5 rounded-lg focus:outline-none"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            )}
            {bulkAction === 'category' && (
              <input
                type="text"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder="Category name"
                className="bg-white/10 border border-white/20 text-white text-sm px-3 py-1.5 rounded-lg focus:outline-none"
              />
            )}

            {bulkAction && bulkAction !== 'delete' && (
              <button
                onClick={executeBulkAction}
                disabled={bulkSaving || (bulkAction !== 'is_new' && bulkAction !== 'is_bestseller' && bulkAction !== 'delete' && !bulkValue)}
                className="px-4 py-1.5 bg-white text-marvvn-black text-sm font-medium rounded-lg hover:bg-marvvn-gray-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                {bulkSaving ? 'Applying...' : 'Apply'}
              </button>
            )}
            {bulkAction === 'delete' && (
              <button
                onClick={executeBulkAction}
                disabled={bulkSaving}
                className="px-4 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                {bulkSaving ? 'Deleting...' : 'Delete All'}
              </button>
            )}
          </div>
          <button
            onClick={() => { setSelected(new Set()); setBulkAction(null); setBulkValue('') }}
            className="ml-auto p-1 hover:bg-white/10 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-white border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-marvvn-gray-500">
                <th className="px-4 py-3 font-medium w-10">
                  <button onClick={toggleSelectAll} className="cursor-pointer">
                    {selected.size === filtered.length && filtered.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-marvvn-black" />
                    ) : (
                      <Square className="w-4 h-4 text-marvvn-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Sizes</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Badge</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className={`border-b last:border-0 hover:bg-marvvn-gray-50 ${selected.has(product.id) ? 'bg-marvvn-gray-50' : ''}`}>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(product.id)} className="cursor-pointer">
                      {selected.has(product.id) ? (
                        <CheckSquare className="w-4 h-4 text-marvvn-black" />
                      ) : (
                        <Square className="w-4 h-4 text-marvvn-gray-400" />
                      )}
                    </button>
                  </td>
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
                    {product.available_sizes && product.available_sizes.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 items-center max-w-[200px]">
                        {product.available_sizes.map((s) => (
                          <span
                            key={s.size}
                            title={`${s.size}: ${s.stock} available`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-marvvn-gray-100 text-marvvn-black border border-marvvn-gray-200 rounded"
                          >
                            <span>{s.size}</span>
                            <span className="text-[10px] text-marvvn-gray-500 font-normal">({s.stock})</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-red-500 font-medium">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {typeof product.stock === 'number' ? (
                      <span className={`font-medium ${product.stock <= 0 ? 'text-red-600' : product.stock <= 5 ? 'text-amber-600' : 'text-green-600'}`}>
                        {product.stock <= 0 ? 'Out of stock' : product.stock}
                      </span>
                    ) : (
                      <span className="text-marvvn-gray-400">—</span>
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
