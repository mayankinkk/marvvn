'use client'

import { useCompare } from '@/lib/compare-context'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { X, Plus } from 'lucide-react'

export default function ComparePage() {
  const { items, removeItem, setIsComparing } = useCompare()

  if (items.length < 2) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container py-16 text-center">
          <h1 className="text-2xl font-display font-medium mb-4">Compare Products</h1>
          <p className="text-marvvn-gray-500 mb-6">Add at least 2 products to compare</p>
          <Link href="/collections/all" className="btn-primary">Browse Products</Link>
        </main>
        <Footer />
      </div>
    )
  }

  const attributes: { label: string; key: string; format: (v: any) => string }[] = [
    { label: 'Price', key: 'price', format: (v: number) => `₹${v?.toLocaleString()}` },
    { label: 'Compare At', key: 'compare_at_price', format: (v: number) => v ? `₹${v.toLocaleString()}` : '—' },
    { label: 'Category', key: 'category', format: (v: string) => v || '—' },
    { label: 'Sizes', key: 'sizes', format: (v: string[]) => v?.join(', ') || '—' },
    { label: 'Description', key: 'description', format: (v: string) => v || '—' },
  ]

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 lg:py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl lg:text-3xl font-display font-medium">Compare Products</h1>
          <button
            onClick={() => { setIsComparing(false); window.history.back() }}
            className="text-sm text-marvvn-gray-500 hover:text-marvvn-black cursor-pointer"
          >
            Back to shop
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="w-40 p-4 text-left align-top"></th>
                {items.map(item => (
                  <th key={item.handle} className="p-4 text-center align-top">
                    <div className="relative group">
                      <button
                        onClick={() => removeItem(item.handle)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-marvvn-gray-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <Link href={`/products/${item.handle}`}>
                        <div className="aspect-square bg-marvvn-gray-50 relative mb-3 overflow-hidden">
                          <Image src={item.image_url} alt={item.title} fill sizes="200px" className="object-cover" />
                        </div>
                        <h3 className="text-sm font-medium hover:text-marvvn-gray-600 transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                      </Link>
                    </div>
                  </th>
                ))}
                {items.length < 4 && (
                  <th className="p-4 text-center align-top">
                    <Link
                      href="/collections/all"
                      className="w-full aspect-square bg-marvvn-gray-50 flex items-center justify-center hover:bg-marvvn-gray-100 transition-colors"
                    >
                      <Plus className="w-6 h-6 text-marvvn-gray-300" />
                    </Link>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {attributes.map(attr => (
                <tr key={attr.key} className="border-t border-marvvn-gray-100">
                  <td className="p-4 text-sm font-medium text-marvvn-gray-500">{attr.label}</td>
                  {items.map(item => (
                    <td key={item.handle} className="p-4 text-sm text-center text-marvvn-gray-700">
                      {attr.format((item as any)[attr.key])}
                    </td>
                  ))}
                  {items.length < 4 && <td className="p-4"></td>}
                </tr>
              ))}
              <tr className="border-t border-marvvn-gray-100">
                <td className="p-4"></td>
                {items.map(item => (
                  <td key={item.handle} className="p-4 text-center">
                    <Link
                      href={`/products/${item.handle}`}
                      className="btn-primary w-full text-xs py-2 inline-block"
                    >
                      View Product
                    </Link>
                  </td>
                ))}
                {items.length < 4 && <td className="p-4"></td>}
              </tr>
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  )
}
