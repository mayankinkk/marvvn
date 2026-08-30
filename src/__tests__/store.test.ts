import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCartStore } from '@/lib/store'
import { Product } from '@/lib/types'

const mockProduct: Product = {
  id: '1',
  handle: 'test-product',
  title: 'Test Product',
  description: 'A test product',
  price: 999,
  compareAtPrice: 1499,
  images: ['/test.jpg'],
  category: 'men',
  collection: ['new-arrivals'],
  tags: ['test'],
  sizes: ['S', 'M', 'L'],
  colors: ['Black', 'White'],
}

const mockProduct2: Product = {
  ...mockProduct,
  id: '2',
  handle: 'test-product-2',
  title: 'Test Product 2',
}

const mockProduct3: Product = {
  ...mockProduct,
  id: '3',
  handle: 'expensive-product',
  title: 'Expensive Product',
  price: 5000,
}

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], promoCode: '', discount: 0, isOpen: false })
  })

  describe('addItem', () => {
    it('adds item to cart', () => {
      const { addItem } = useCartStore.getState()
      addItem(mockProduct, 'M', 'Black')

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].product.id).toBe('1')
      expect(items[0].size).toBe('M')
      expect(items[0].color).toBe('Black')
      expect(items[0].quantity).toBe(1)
    })

    it('increments quantity for same item', () => {
      const { addItem } = useCartStore.getState()
      addItem(mockProduct, 'M', 'Black')
      addItem(mockProduct, 'M', 'Black')

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(2)
    })

    it('keeps different sizes as separate items', () => {
      const { addItem } = useCartStore.getState()
      addItem(mockProduct, 'S', 'Black')
      addItem(mockProduct, 'M', 'Black')

      expect(useCartStore.getState().items).toHaveLength(2)
    })

    it('keeps different colors as separate items', () => {
      const { addItem } = useCartStore.getState()
      addItem(mockProduct, 'M', 'Black')
      addItem(mockProduct, 'M', 'White')

      expect(useCartStore.getState().items).toHaveLength(2)
    })

    it('adds with custom quantity', () => {
      const { addItem } = useCartStore.getState()
      addItem(mockProduct, 'M', 'Black', 3)

      expect(useCartStore.getState().items[0].quantity).toBe(3)
    })

    it('clamps quantity to 99', () => {
      const { addItem } = useCartStore.getState()
      addItem(mockProduct, 'M', 'Black', 200)

      expect(useCartStore.getState().items[0].quantity).toBe(99)
    })
  })

  describe('removeItem', () => {
    it('removes item from cart', () => {
      const { addItem, removeItem } = useCartStore.getState()
      addItem(mockProduct, 'M', 'Black')
      removeItem('1', 'M', 'Black')

      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('only removes matching item', () => {
      const { addItem, removeItem } = useCartStore.getState()
      addItem(mockProduct, 'M', 'Black')
      addItem(mockProduct2, 'M', 'Black')
      removeItem('1', 'M', 'Black')

      expect(useCartStore.getState().items).toHaveLength(1)
      expect(useCartStore.getState().items[0].product.id).toBe('2')
    })
  })

  describe('updateQuantity', () => {
    it('updates quantity', () => {
      const { addItem, updateQuantity } = useCartStore.getState()
      addItem(mockProduct, 'M', 'Black')
      updateQuantity('1', 'M', 'Black', 5)

      expect(useCartStore.getState().items[0].quantity).toBe(5)
    })

    it('removes item when quantity is 0', () => {
      const { addItem, updateQuantity } = useCartStore.getState()
      addItem(mockProduct, 'M', 'Black')
      updateQuantity('1', 'M', 'Black', 0)

      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('removes item when quantity is negative', () => {
      const { addItem, updateQuantity } = useCartStore.getState()
      addItem(mockProduct, 'M', 'Black')
      updateQuantity('1', 'M', 'Black', -1)

      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('clamps quantity to 99', () => {
      const { addItem, updateQuantity } = useCartStore.getState()
      addItem(mockProduct, 'M', 'Black')
      updateQuantity('1', 'M', 'Black', 200)

      expect(useCartStore.getState().items[0].quantity).toBe(99)
    })
  })

  describe('calculations', () => {
    it('calculates total items', () => {
      const { addItem } = useCartStore.getState()
      addItem(mockProduct, 'M', 'Black')
      addItem(mockProduct, 'L', 'White')
      addItem(mockProduct2, 'S', 'Black')

      expect(useCartStore.getState().totalItems()).toBe(3)
    })

    it('calculates total items with quantities', () => {
      const { addItem } = useCartStore.getState()
      addItem(mockProduct, 'M', 'Black', 3)
      addItem(mockProduct2, 'S', 'Black', 2)

      expect(useCartStore.getState().totalItems()).toBe(5)
    })

    it('calculates total price', () => {
      const { addItem } = useCartStore.getState()
      addItem(mockProduct, 'M', 'Black')
      addItem(mockProduct2, 'L', 'White')

      expect(useCartStore.getState().totalPrice()).toBe(1998)
    })

    it('calculates total price with quantities', () => {
      const { addItem } = useCartStore.getState()
      addItem(mockProduct, 'M', 'Black', 2)

      expect(useCartStore.getState().totalPrice()).toBe(1998)
    })

    it('calculates final price with percentage discount', () => {
      const { addItem } = useCartStore.getState()
      addItem(mockProduct, 'M', 'Black')

      useCartStore.setState({ discount: 10 })

      expect(useCartStore.getState().finalPrice()).toBeCloseTo(899.1, 0)
    })

    it('final price equals total when no discount', () => {
      const { addItem } = useCartStore.getState()
      addItem(mockProduct, 'M', 'Black')

      expect(useCartStore.getState().finalPrice()).toBe(999)
    })

    it('final price with 100% discount is 0', () => {
      const { addItem } = useCartStore.getState()
      addItem(mockProduct, 'M', 'Black')

      useCartStore.setState({ discount: 100 })

      expect(useCartStore.getState().finalPrice()).toBe(0)
    })
  })

  describe('clearCart', () => {
    it('clears all items and promo', () => {
      const { addItem, clearCart } = useCartStore.getState()
      addItem(mockProduct, 'M', 'Black')
      useCartStore.setState({ promoCode: 'TEST10', discount: 10 })
      clearCart()

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(0)
      expect(state.promoCode).toBe('')
      expect(state.discount).toBe(0)
    })
  })

  describe('promo code', () => {
    it('applies valid promo code via API', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ valid: true, code: 'TEST10', discount_value: 10 }),
      })

      const { applyPromoCode } = useCartStore.getState()
      const result = await applyPromoCode('TEST10')

      expect(result).toBe(true)
      expect(useCartStore.getState().promoCode).toBe('TEST10')
      expect(useCartStore.getState().discount).toBe(10)
    })

    it('rejects invalid promo code', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ valid: false }),
      })

      const { applyPromoCode } = useCartStore.getState()
      const result = await applyPromoCode('INVALID')

      expect(result).toBe(false)
      expect(useCartStore.getState().promoCode).toBe('')
    })

    it('removes promo code', async () => {
      useCartStore.setState({ promoCode: 'TEST10', discount: 10 })
      const { removePromoCode } = useCartStore.getState()
      removePromoCode()

      const state = useCartStore.getState()
      expect(state.promoCode).toBe('')
      expect(state.discount).toBe(0)
    })
  })

  describe('cart open/close', () => {
    it('toggles cart open state', () => {
      const { toggleCart } = useCartStore.getState()
      expect(useCartStore.getState().isOpen).toBe(false)

      toggleCart()
      expect(useCartStore.getState().isOpen).toBe(true)

      toggleCart()
      expect(useCartStore.getState().isOpen).toBe(false)
    })

    it('sets cart open directly', () => {
      const { setCartOpen } = useCartStore.getState()
      setCartOpen(true)
      expect(useCartStore.getState().isOpen).toBe(true)
      setCartOpen(false)
      expect(useCartStore.getState().isOpen).toBe(false)
    })
  })
})
