'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FaqItem {
  q: string
  a: string
}

interface FaqAccordionProps {
  categories: { category: string; items: FaqItem[] }[]
}

export default function FaqAccordion({ categories }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      {categories.map((cat) => (
        <div key={cat.category}>
          <h2 className="text-lg font-medium mb-4 pb-2 border-b">{cat.category}</h2>
          <div className="divide-y">
            {cat.items.map((item, i) => {
              const key = `${cat.category}-${i}`
              const isOpen = openIndex === key
              return (
                <div key={key}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : key)}
                    className="flex items-center justify-between w-full py-4 text-left"
                  >
                    <span className="text-sm font-medium pr-4">{item.q}</span>
                    <ChevronDown className={cn('w-4 h-4 flex-shrink-0 transition-transform', isOpen && 'rotate-180')} />
                  </button>
                  {isOpen && (
                    <p className="pb-4 text-sm text-marvvn-gray-600 leading-relaxed">{item.a}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
