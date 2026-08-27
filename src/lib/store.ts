'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, CartItem } from './types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  promoCode: string
  discount: number
  addItem: (product: Product, size: string, color: string) => void
  removeItem: (productId: string, size: string, color: string) => void
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  applyPromoCode: (code: string) => boolean
  removePromoCode: () => void
  totalItems: () => number
  totalPrice: () => number
  finalPrice: () => number
}

const PROMO_CODES: Record<string, number> = {
  'SHARKTANK10': 10,
  'WELCOME10': 10,
  'MARVNN15': 15,
  'FLAT20': 20,
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      promoCode: '',
      discount: 0,

      addItem: (product, size, color) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id && item.size === size && item.color === color
          )

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id && item.size === size && item.color === color
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            }
          }

          return {
            items: [...state.items, { product, quantity: 1, size, color }],
          }
        })
      },

      removeItem: (productId, size, color) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.size === size && item.color === color)
          ),
        }))
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && item.size === size && item.color === color
              ? { ...item, quantity }
              : item
          ),
        }))
      },

      clearCart: () => set({ items: [], promoCode: '', discount: 0 }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      setCartOpen: (open) => set({ isOpen: open }),

      applyPromoCode: (code) => {
        const upperCode = code.toUpperCase()
        if (PROMO_CODES[upperCode]) {
          set({ promoCode: upperCode, discount: PROMO_CODES[upperCode] })
          return true
        }
        return false
      },

      removePromoCode: () => set({ promoCode: '', discount: 0 }),

      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0)
      },

      finalPrice: () => {
        const total = get().totalPrice()
        const discount = get().discount
        return total - (total * discount) / 100
      },
    }),
    {
      name: 'marvnn-cart',
      partialize: (state) => ({
        items: state.items,
        promoCode: state.promoCode,
        discount: state.discount,
      }),
    }
  )
)
