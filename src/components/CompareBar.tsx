'use client'

import Image from 'next/image'
import { useCompare } from '@/lib/compare-context'
import { X, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CompareBar() {
  const { items, removeItem, clearItems, setIsComparing } = useCompare()
  const router = useRouter()

  if (items.length === 0) return null

  const handleCompare = () => {
    if (items.length < 2) return
    setIsComparing(true)
    router.push('/compare')
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 animate-slide-up">
      <div className="container py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto">
          {items.map(item => (
            <div key={item.handle} className="flex items-center gap-2 bg-marvvn-gray-50 px-3 py-1.5 flex-shrink-0">
              <div className="w-8 h-8 relative bg-marvvn-gray-100 overflow-hidden">
                <Image src={item.image_url} alt={item.title} fill sizes="32px" className="object-cover" />
              </div>
              <span className="text-xs font-medium max-w-[100px] truncate">{item.title}</span>
              <button onClick={() => removeItem(item.handle)} className="text-marvvn-gray-400 hover:text-marvvn-black cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-marvvn-gray-400">{items.length}/4</span>
          <button
            onClick={clearItems}
            className="text-xs text-marvvn-gray-400 hover:text-marvvn-black cursor-pointer"
          >
            Clear
          </button>
          <button
            onClick={handleCompare}
            disabled={items.length < 2}
            className="flex items-center gap-1.5 bg-marvvn-black text-white px-4 py-2 text-xs font-medium disabled:opacity-40 cursor-pointer"
          >
            Compare <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
