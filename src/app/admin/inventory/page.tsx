'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/inventory')
      .then(res => res.json())
      .then(data => { setProducts(data.products || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="p-2 hover:bg-marvvn-gray-100 rounded transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-medium">Inventory Alerts</h1>
          <p className="text-sm text-marvvn-gray-500">Products with low stock levels</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-marvvn-black border-t-transparent rounded-full" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-marvvn-gray-500">No low stock products</p>
        </div>
      ) : (
        <div className="bg-white border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-marvvn-gray-50">
                <th className="px-4 py-3 text-left font-medium">Product</th>
                <th className="px-4 py-3 text-left font-medium">Stock</th>
                <th className="px-4 py-3 text-left font-medium">Threshold</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-marvvn-gray-50">
                  <td className="px-4 py-3 font-medium">{product.title}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${product.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-marvvn-gray-500">{product.threshold}</td>
                  <td className="px-4 py-3">
                    {product.stock === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        <AlertTriangle className="w-3 h-3" /> Out of Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/products`} className="text-sm text-marvvn-black underline hover:no-underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
