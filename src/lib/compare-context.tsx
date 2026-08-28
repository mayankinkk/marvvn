'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface Product {
  id: string
  title: string
  handle: string
  price: number
  compare_at_price?: number
  image_url: string
  description?: string
  category?: string
  sizes?: string[]
}

interface CompareContextType {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (handle: string) => void
  clearItems: () => void
  isComparing: boolean
  setIsComparing: (v: boolean) => void
}

const CompareContext = createContext<CompareContextType | undefined>(undefined)

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const [isComparing, setIsComparing] = useState(false)

  const addItem = (product: Product) => {
    setItems(prev => {
      if (prev.find(p => p.handle === product.handle)) return prev
      if (prev.length >= 4) return prev
      return [...prev, product]
    })
  }

  const removeItem = (handle: string) => {
    setItems(prev => prev.filter(p => p.handle !== handle))
  }

  const clearItems = () => setItems([])

  return (
    <CompareContext.Provider value={{ items, addItem, removeItem, clearItems, isComparing, setIsComparing }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used within CompareProvider')
  return ctx
}
